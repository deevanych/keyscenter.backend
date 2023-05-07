/**
 * product service
 */

// @ts-nocheck

import {factories} from '@strapi/strapi';

export default factories.createCoreService('api::product.product', ({strapi}) => ({
  async find() {
    const results = await strapi.db.query('api::product.product').findMany({
      select: [
        'title',
        'price',
        'salePrice',
        'slug',
      ],
      populate: {
        images: {
          select: ['formats']
        },
        product_category: {
          select: ['slug', 'title']
        },
        product_keys: {
          select: ['id'],
          where: {
            $and: [
              {
                published_at: {
                  $notNull: true
                }
              }
            ]
          }
        }
      }
    })

    return {results}
  },
  async findOne(slug: string, params: { populate: any }) {
    return await strapi.db.query('api::product.product').findOne({
      ...params,
      where: {slug},
      select: [
        'title',
        'price',
        'salePrice',
        'slug',
        'description',
        'instruction',
        'views'
      ],
        populate: {
          images: {
            select: ['formats']
          },
          platforms: {
            select: ['title']
          },
          product_category: {
            select: ['slug', 'title']
          },
          product_type: {
            select: ['title']
          },
          delivery_method: {
            select: ['title']
          },
          product_keys: {
            select: ['id'],
            where: {
              $and: [
                {
                  published_at: {
                    $notNull: true
                  }
                }
              ]
            }
          }
        }
      })
    }
  })
)

