/**
 * order service
 */

// @ts-nocheck

import { factories } from '@strapi/strapi';
import { v4 } from "uuid";
import { createHash } from "crypto";
import utils from "@strapi/utils";
import fetch from 'node-fetch';

const { NotFoundError, ForbiddenError } = utils.errors

export default factories.createCoreService('api::order.order', ({ strapi }) => ({
  async create (ctx) {
    const { cartId, email } = ctx.data
    const productKeysIds = []

    let user = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: {
        email
      }
    })

    if (!user) {
      user = await strapi.db.query('plugin::users-permissions.user').create({
        data: {
          username: email,
          email
        }
      })
    }

    const cart = await strapi.db.query('api::cart.cart').findOne({
      where: {
        uuid: cartId
      },
      populate: {
        items: {
          select: ['quantity'],
          populate: {
            product: {
              select: ['id', 'title', 'salePrice', 'price']
            }
          }
        }
      }
    })

    const receiptItems = cart.items.map(item => {
      const price = item.product.salePrice ?? item.product.price

      return {
        description: item.product.title,
        amount: {
          value: price.toFixed(2),
          currency: 'RUB'
        },
        vat_code: 4,
        quantity: item.quantity
      }
    })

    for (const item of cart.items) {
      const productKeys = await strapi.db.query('api::product-key.product-key').findMany({
        where: {
          product: item.product.id,
          published_at: {
            $notNull: true
          }
        },
        limit: item.quantity,
        select: ['id']
      })

      if (item.quantity < productKeys.length) {
        throw new NotFoundError(`В наличии осталось: ${productKeys.length} штук`)
      }

      productKeysIds.push(...productKeys.map((key) => key.id))
    }

    const order = await strapi.db.query('api::order.order').create({
      data: {
        uuid: v4(),
        sum: cart.sum,
        cart: cart.id,
        product_keys: productKeysIds,
        user: user.id
      },
      select: ['uuid', 'sum']
    })
    const paymentUrl = new URL(process.env.PAYMENT_RETURN_PATH, process.env.FRONTEND_URL)
    paymentUrl.searchParams.append('orderId', order.uuid)

    const payment = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Idempotence-Key': order.uuid,
        'Content-Type': 'application/json',
        'Authorization': process.env.YOOKASSA_AUTH
      },
      body: JSON.stringify({
        amount: {
          value: order.sum.toFixed(2),
          currency: 'RUB'
        },
        confirmation: {
          type: 'redirect',
          return_url: paymentUrl.href
        },
        payment_method_data: {
          type: 'bank_card'
        },
        description: `Оплата заказа №${order.uuid} на сумму ${order.sum} рублей`,
        metadata: {
          order: order.uuid
        },
        receipt: {
          items: receiptItems
        }
      })
    });

    return await payment.json()
  },
  async orderStatusHook (ctx) {
    try {
      const {body, query} = ctx.request

      if (query.secret !== process.env.PAYMENT_HOOK_SECRET) {
        throw new ForbiddenError('Notification has been hacked');
      }

      if (body.type === 'notification' && body.event === 'payment.succeeded') {
        const order_uuid = body.object.metadata.order

        await strapi.db.query('api::order.order').update({
          where: {
            uuid: order_uuid
          },
          select: ['paid_at', 'sum'],
          populate: {
            cart: {
              select: ['uuid']
            }
          },
          data: {
            paid_at: body.object.captured_at,
            transaction_id: body.object.id
          }
        })

        return 'success'
      } else {
        throw new ForbiddenError('Notification has been hacked');
      }
    } catch (e) {
      throw new ForbiddenError(e);
    }

    return 'success'
  },
  async findOne(uuid: string) {
    return await strapi.db.query('api::order.order').findOne({
      where: {uuid}
    })
  }
}));
