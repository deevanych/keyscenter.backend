/**
 * `checkUserProductOrder` middleware
 */

// @ts-nocheck
// todo create types

import { Strapi } from '@strapi/strapi';
import { NotFoundError } from 'rxjs';

export default (config, { strapi }: { strapi: Strapi }) => {
  return async (ctx, next) => {
    const { product_id, email } = ctx.request.body.data

    const user = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: {
        email
      },
      select: [],
      populate: {
        orders: {
          select: [],
          where: {
            paid_at: {
              $notNull: true
            }
          },
          populate: {
            cart: {
              select: [],
              populate: {
                items: {
                  select: [],
                  populate: {
                    product: {
                      select: ['id']
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!user) {
      ctx.assert(ctx.state.user, 404, 'Пользователь не найден');
    }

    const boughtProductsIds: number[] = []

    user.orders.forEach(order => {
      order.cart.items.forEach(item => {
        boughtProductsIds.push(item.product.id)
      })
    })

    if (!boughtProductsIds.includes(product_id)) {
      ctx.assert(ctx.state.user, 404, 'Вы не покупали этот товар');
    }

    await next();
  };
};
