/**
 * coupon controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::coupon.coupon', ({ strapi }) => ({
  async apply(ctx) {
    console.log(ctx.request.body.data)
  },
  async cancel(ctx) {
    console.log(ctx.request.body.data)
  }
}));
