/**
 * `checkCouponConditions` middleware
 */
// @ts-nocheck

import {Strapi} from '@strapi/strapi';
import {errors} from "@strapi/utils";

const {ForbiddenError, NotFoundError} = errors;

export default (config, {strapi}: { strapi: Strapi }) => {
  return async (ctx, next) => {
    const {code} = ctx.request.body.data
    const {cartId: uuid} = ctx.request.params

    try {
      const {
        max_applies_count,
        applies_count,
        can_be_applied_with_other,
        publishedAt
      } = await strapi.db.query('api::coupon.coupon').findOne({
        where: {
          code
        },
        select: [
          'max_applies_count',
          'applies_count',
          'can_be_applied_with_other',
          'published_at'
        ]
      })
      const {coupons: cartAppliedCoupons} = await strapi.db.query('api::cart.cart').findOne({
        where: {
          uuid
        },
        select: ['id'],
        populate: {
          coupons: {
            select: ['id', 'can_be_applied_with_other']
          }
        }
      })

      if (!publishedAt) {
        throw new NotFoundError('Промокод не найден');
      }

      if (+max_applies_count > -1 && +applies_count >= +max_applies_count) {
        throw new ForbiddenError('Срок действия промокода истек');
      }

      if (!can_be_applied_with_other) {
        if (cartAppliedCoupons.length > 0) {
          throw new ForbiddenError('Промокод не может быть применен с другими промокодами');
        }
      }

      const existUniqueCoupon = cartAppliedCoupons.find((coupon) => !coupon.can_be_applied_with_other)

      if (existUniqueCoupon) {
        await strapi.db.query('api::cart.cart').update({
          where: {
            uuid
          },
          data: {
            coupons: {
              disconnect: [existUniqueCoupon.id]
            }
          }
        })
      }

      await next();
    } catch (_) {
      throw new NotFoundError('Промокод не найден');
    }
  };
};
