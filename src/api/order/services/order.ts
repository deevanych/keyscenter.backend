/**
 * order service
 */

// @ts-nocheck

import { factories } from '@strapi/strapi';
import {v4} from "uuid";
import {createHash} from "crypto";
import utils from "@strapi/utils";
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
              select: ['id']
            }
          }
        }
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

    return await strapi.db.query('api::order.order').create({
      data: {
        uuid: v4(),
        sum: cart.sum,
        cart: cart.id,
        product_keys: productKeysIds,
        user: user.id
      },
      select: ['uuid', 'sum']
    })
  },
  async orderStatusHook (ctx) {
    try {
      const {body} = ctx.request
      const order_uuid = body.label
      const validationParams = [
        body.notification_type,
        body.operation_id,
        body.amount,
        body.currency,
        body.datetime,
        body.sender,
        body.codepro,
        process.env.YOOUMONEY_SECRET,
        body.label
      ]
      const hashInstance = createHash('sha1')
      hashInstance.update(validationParams.join('&'))
      const hexString = hashInstance.digest('hex')

      if (body.sha1_hash !== hexString) {
        throw new ForbiddenError('Hashes are not equals');
      }

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
          paid_at: body.datetime,
          transaction_id: body.operation_id
        }
      })

      return 'success'
    } catch (e) {
      throw new ForbiddenError(e);
    }

    return 'success'
  }
}));
