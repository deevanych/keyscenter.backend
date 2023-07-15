/**
 * cta controller
 */

// @ts-nocheck

import {factories} from '@strapi/strapi'

export default factories.createCoreController('api::cta.cta', ({strapi}) => ({
  async findOne(ctx) {
    const {id: handler} = ctx.params

    return await strapi.db.query('api::cta.cta').findOne({
      where: {
        handler
      },
      populate: {
        image: {
          select: ['url']
        },
        lottie: {
          select: ['url']
        },
        product: {
          select: ['slug', 'price', 'salePrice'],
          populate: {
            product_category: {
              select: ['slug']
            }
          }
        },
        page: {
          select: ['slug']
        }
      }
    })
  }
}));
