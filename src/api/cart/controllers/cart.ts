/**
 * cart controller
 */

// @ts-nocheck

import {factories} from '@strapi/strapi'

export default factories.createCoreController('api::cart.cart', ({strapi}) => ({
  async create() {
    return await strapi.service('api::cart.cart').create()
  },
  async findOne(ctx) {
    return await strapi.service('api::cart.cart').findOne(ctx.params.id)
  },
  async addOrUpdateItem(ctx) {
    return await strapi.service('api::cart.cart').addOrUpdateItem(ctx.params.cartId, ctx.request.body.data)
  },
  async deleteItem(ctx) {
    return await strapi.service('api::cart.cart').deleteItem(ctx.params.cartId, ctx.params.itemId)
  }
  })
);
