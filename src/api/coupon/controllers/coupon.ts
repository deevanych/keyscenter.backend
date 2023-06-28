/**
 * coupon controller
 */

// @ts-nocheck
// todo placed to service

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::coupon.coupon', ({ strapi }) => ({
  async apply(ctx) {
    const { code } = ctx.request.body.data
    const { cartId: uuid } = ctx.request.params

    const { id: couponId } = await strapi.db.query('api::coupon.coupon').findOne({
      where: {
        code
      },
      select: ['id', 'applies_count']
    })

    const { id: cartId } = await strapi.db.query('api::cart.cart').findOne({
      where: {
        uuid
      },
      select: ['id']
    })

    return await strapi.service('api::cart.cart').update(cartId, {
      data: {
        coupons: {
          connect: [couponId]
        }
      }
    })
  },
  async cancel(ctx) {
    const { cartId: uuid, code } = ctx.request.params

    const { id: couponId } = await strapi.db.query('api::coupon.coupon').findOne({
      where: {
        code
      },
      select: ['id', 'applies_count']
    })

    const { id: cartId } = await strapi.db.query('api::cart.cart').findOne({
      where: {
        uuid
      },
      select: ['id']
    })

    return await strapi.service('api::cart.cart').update(cartId, {
      data: {
        coupons: {
          disconnect: [couponId]
        }
      }
    })
  }
}));
