/**
 * order service
 */

// @ts-nocheck

import { factories } from '@strapi/strapi';
import {v4} from "uuid";
import { createHash, type Hash } from "crypto";
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
      const order_uuid = body.orderid
      const validationParams = [
        body.id,
        body.sum,
        body.clientid,
        body.orderid,
        process.env.PAYKEEPER_SECRET
      ]
      const hashInstance: Hash = createHash('md5')
      hashInstance.update(validationParams.join(''))
      const hexString = hashInstance.digest('hex')

      if (body.key !== hexString) {
        throw new ForbiddenError('Hashes are not equals');
      }

      const order = await strapi.db.query('api::order.order').findOne({
        where: {
          uuid: order_uuid
        },
        select: ['sum']
      })

      if (+order.sum !== +body.sum) {
        throw new ForbiddenError('Sum are not equals');
      }

      // get paid_at and sum for lifecycle 'afterUpdate'
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
          paid_at: body.obtain_datetime,
          transaction_id: body.id
        }
      })

      return 'success'
    } catch (e) {
      throw new ForbiddenError(e);
    }
  }
}));
