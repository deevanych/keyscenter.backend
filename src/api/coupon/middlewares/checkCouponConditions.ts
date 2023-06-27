/**
 * `checkCouponConditions` middleware
 */

import { Strapi } from '@strapi/strapi';

export default (config, { strapi }: { strapi: Strapi }) => {
  return async (ctx, next) => {
    const { code } = ctx.request.body.data
    const { cartId } = ctx.request.params

    // const coupon

    await next();
  };
};
