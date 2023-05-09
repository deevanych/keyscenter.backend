import nodemailer from 'nodemailer'
import {emailTemplate} from '../../../../data/emailTemplate'

export default {
  async afterUpdate(event) {
    const {result} = event

    try {
      if (result.paid_at) {
        const order = await strapi.entityService.findOne('api::order.order', result.id, {
          populate: {
            user: {
              fields: ['email']
            },
            cart: {
              fields: ['uuid']
            },
            product_keys: {
              select: ['id'],
              populate: {
                product: {
                  fields: ['id', 'title', 'slug', 'price', 'salePrice'],
                  populate: {
                    product_category: {
                      fields: ['slug']
                    },
                    images: {
                      fields: ['formats']
                    }
                  }
                }
              }
            }
          }
        })

        const orderProducts = []

        order.product_keys.forEach((key) => {
          if (!orderProducts.find((product) => product.id === key.product.id)) {
            orderProducts.push(key.product)
          }
        })

        await strapi.db.query('api::cart.cart').update({
          where: {
            uuid: order.cart.uuid
          },
          select: [],
          data: {
            paid_at: result.paid_at
          }
        })

        await strapi.db.query('api::product-key.product-key').updateMany({
          where: {
            $or: order.product_keys.map((key) => {
              return {id: key.id}
            })
          },
          select: [],
          data: {
            publishedAt: null
          }
        })

        const products = orderProducts.map((product) => {
          const keys = order.product_keys.map((key) => key.key)

          return {
            id: product.id,
            title: product.title,
            href: new URL('catalog/' + product.product_category.slug + '/' + product.slug, process.env.FRONTEND_URL).href,
            preview: new URL(product.images[0].formats.thumbnail.url, process.env.BASE_URL).href,
            keys,
            price: product.salePrice ?? product.price
          }
        })

        console.log('Order has been paid!')
        const emailTo = order.user.email
        // const testAccount = await nodemailer.createTestAccount();

        // let transporter = nodemailer.createTransport({
        //   host: "smtp.ethereal.email",
        //   port: 587,
        //   secure: false,
        //   auth: {
        //     user: testAccount.user, // generated ethereal user
        //     pass: testAccount.pass, // generated ethereal password
        //   },
        // });
        try {
          const transporter = nodemailer.createTransport({
            host: "smtp.beget.com",
            port: 25,
            secure: false,
            auth: {
              user: process.env.BEGET_MAIL_LOGIN, // generated ethereal user
              pass: process.env.BEGET_MAIL_PASSWORD, // generated ethereal password
            },
          });

          await transporter.sendMail({
            from: "KEYSCENTER <order@keyscenter.ru>",
            to: emailTo,
            subject: "Заказ в keyscenter.ru",
            html: emailTemplate(products, result.sum)
          });
        } catch (e) {
          console.log(e)
        }
      }
    } catch (e) {
      console.log(e)
    }
  },
};
