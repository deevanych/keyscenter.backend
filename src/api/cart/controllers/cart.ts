/**
 * cart controller
 */

// @ts-nocheck

import {factories} from '@strapi/strapi'

export default factories.createCoreController('api::cart.cart', ({strapi}) => ({
    async create(ctx) {
      ctx.request.body.data = {}

      return await super.create(ctx)
    },
    async findOne(ctx) {
      return await strapi.db.query('api::cart.cart').findOne({
        where: {
          uuid: ctx.params.id
        },
        populate: {
          items: {
            select: ['id', 'quantity'],
            populate: {
              product: {
                select: ['id', 'salePrice']
              }
            }
          }
        }
      })
    },
    async addOrUpdateItem(ctx) {
      return await strapi.service('api::cart.cart').addOrUpdateItem(ctx.params.cartId, ctx.request.body.data)
    },
    async deleteItem(ctx) {
      return await strapi.service('api::cart.cart').deleteItem(ctx.params.cartId, ctx.params.itemId)
    }
  })
);