import nodemailer from 'nodemailer'
import {emailTemplate} from '../../../../data/emailTemplate'
import {GetValues} from "@strapi/types/dist/modules/entity-service";

// @ts-ignore
export default {
  async beforeUpdate(event) {
    const {where, data} = event.params

    const order = await strapi.db.query('api::order.order').findOne({
      where,
      select: ['paid_at']
    })

    event.state = {
      orderHasBeenPaid: order.paid_at !== data.paid_at
    }
  },
  async afterUpdate(event) {
    const {result, state} = event

    try {
      if (state.orderHasBeenPaid && result.paid_at) {
        const order: GetValues<any> = await strapi.entityService.findOne('api::order.order', result.id, {
          populate: {
            user: {
              fields: ['email']
            },
            cart: {
              fields: ['uuid'],
              populate: {
                coupons: {
                  fields: ['id']
                }
              }
            },
            product_keys: {
              // @ts-ignore
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

        if (order.cart.coupons.length > 0) {
          const coupons = await strapi.db.query('api::coupon.coupon').findMany({
            where: {
              $or: order.cart.coupons.map((coupon) => {
                return {
                  id: coupon.id
                }
              })
            }
          })

          for (const coupon of coupons) {
            await strapi.db.query('api::coupon.coupon').update({
              where: {
                id: coupon.id
              },
              data: {
                applies_count: +coupon.applies_count + 1
              }
            })
          }
        }

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

        try {
          const testAccount = await nodemailer.createTestAccount();
          let transporter

          if (process.env.NODE_ENV !== 'production') {
            transporter = nodemailer.createTransport({
              host: "smtp.ethereal.email",
              port: 587,
              secure: false,
              auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
              },
            });
          } else {
            transporter = nodemailer.createTransport({
              host: "smtp.beget.com",
              port: 25,
              secure: false,
              auth: {
                user: process.env.BEGET_MAIL_LOGIN, // generated ethereal user
                pass: process.env.BEGET_MAIL_PASSWORD, // generated ethereal password
              },
            });
          }

          const emailResult = await transporter.sendMail({
            from: "KEYSCENTER <order@keyscenter.ru>",
            to: emailTo,
            subject: "Заказ в keyscenter.ru",
            html: emailTemplate(products, result.sum)
          });

          console.log(nodemailer.getTestMessageUrl(emailResult))
        } catch (e) {
          console.log(e)
        }
      }
    } catch (e) {
      console.log(e)
    }
  },
};
