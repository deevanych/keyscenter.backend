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
        'description',
        'salePrice',
        'slug',
      ],
      populate: {
        images: {
          select: ['formats']
        },
        reviews: {
          select: ['text', 'is_positive', 'created_at']
        },
        product_category: {
          select: ['slug', 'title', 'id']
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
    const { views } = await strapi.db.query('api::product.product').findOne({
      where: {slug},
      select: ['views']
    })

    return await strapi.db.query('api::product.product').update({
      ...params,
      where: {slug},
      data: {
        views: +views + 1
      },
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
          reviews: {
            select: ['text', 'is_positive', 'created_at']
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

