/**
 * carousel controller
 */

// @ts-nocheck

import {factories} from '@strapi/strapi'

export default factories.createCoreController('api::carousel.carousel', ({strapi}) => ({
  async findOne(ctx) {
    const {id: handler} = ctx.params

    return await strapi.db.query('api::carousel.carousel').findOne({
      where: {
        handler
      },
      populate: {
        'carousel_items': {
          order: {
            createdAt: 'desc'
          },
          populate: {
            image: {
              select: ['url']
            },
            product: {
              select: ['slug'],
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
        }
      }
    })
  }
}));
