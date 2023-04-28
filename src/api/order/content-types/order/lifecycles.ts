import nodemailer from 'nodemailer'
import {emailTemplate} from '../../../../data/emailTemplate'

export default {
  async afterUpdate(event) {
    const {result} = event
    const order = await strapi.entityService.findOne('api::order.order', result.id, {
      populate: {
        product_keys: {
          populate: {
            product: {
              fields: ['id']
            }
          }
        },
        products: {
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
    })
    const products = order.products.map((product) => {
      const keys = order.product_keys.filter((key) => key.product.id === product.id).map((key) => key.key)

      return {
        id: product.id,
        title: product.title,
        href: new URL('catalog/' + product.product_category.slug + '/' + product.slug, process.env.FRONTEND_URL).href,
        preview: new URL(product.images[0].formats.thumbnail.url, process.env.BASE_URL).href,
        keys,
        price: product.salePrice
      }
    })

    if (result.is_paid) {
      console.log('Order has been paid!')
      const emailTo = result.users_permissions_user.email
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
  },
};
