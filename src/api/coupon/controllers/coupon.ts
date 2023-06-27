/**
 * coupon controller
 */

// @ts-nocheck

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::coupon.coupon', ({ strapi }) => ({
  async apply(ctx) {
    const { coupon: couponId } = ctx.request.body.data
    const { cartId: uuid } = ctx.request.params

    const coupon = await strapi.db.query('api::coupon.coupon').findOne({
      where: {
        coupon: couponId
      }
    })

    const { id: cartId } = await strapi.db.query('api::cart.cart').findOne({
      where: {
        uuid
      },
      select: []
    })

    return await strapi.service('api::cart.cart').update(cartId, {
      data: {
        coupons: {
          connect: [coupon.id]
        }
      }
    })
  },
  async cancel(ctx) {
    const { coupon } = ctx.request.body.data
  }
}));
