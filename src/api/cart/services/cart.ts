/**
 * cart service
 */

// @ts-nocheck

import {factories} from '@strapi/strapi';
import {v4} from 'uuid';

const serializeCart = (cart) => {
  return {
    ...cart,
    items: cart.items.map((item) => {
      item.product.category = item.product.product_category.slug
      item.product.thumbnail = item.product.images[0].formats.thumbnail.url
      item.availableCount = item.product.product_keys.length

      delete item.product.product_category
      delete item.product.images
      delete item.product.product_keys

      return item
    })
  }
}

const COMPONENT_NAME = 'cart.item'
const SERIALIZED_PARAMS = {
  fields: ['uuid', 'sum'],
  populate: {
    items: {
      fields: ['quantity'],
      populate: {
        product: {
          populate: {
            product_keys: {
              fields: ['id', 'published_at'],
              filters: {
                publishedAt: {
                  $notNull: true
                }
              },
            },
            product_category: {
              fields: ['slug']
            },
            images: {
              fields: ['formats'],
              populate: {
                formats: true
              }
            }
          },
          fields: ['price', 'salePrice', 'slug', 'title']
        }
      }
    },
    coupons: {
      fields: ['coupon', 'discount', 'discount_type']
    }
  }
}

export default factories.createCoreService('api::cart.cart', ({strapi}) => ({
  async create() {
    SERIALIZED_PARAMS.data = {
      uuid: v4()
    }

    return await super.create(SERIALIZED_PARAMS)
  },
  async findOne(entityId, params) {
    const cart = await strapi.db.query('api::cart.cart').findOne(({
      where: {
        uuid: entityId
      },
      select: ['id', 'paid_at']
    }))

    if (!cart || cart.paid_at) {
      return this.create()
    }

    const serializedParams = {
      ...SERIALIZED_PARAMS,
      ...params
    }

    return serializeCart(await super.findOne(cart.id, serializedParams))
  },
  async update(entityId, params) {
    const serializedParams = {
      ...SERIALIZED_PARAMS,
      ...params
    }

    return serializeCart(await super.update(entityId, serializedParams));
  }
  ,
  async getSumByItems(items) {
    const productsIDs = items.map((item) => {
      return {
        id: item.product
      }
    })

    let products = []

    if (productsIDs.length) {
      products = await strapi.db.query('api::product.product').findMany({
        where: {
          $or: productsIDs
        },
        select: ['id', 'price', 'salePrice']
      })
    }

    return products.reduce((sum, product) => {
      const item = items.find((_item) => _item.product === product.id)
      const price = product.salePrice ?? product.price

      return sum + +item.quantity * +price
    }, 0)
  }
  ,
  async getCart(uuid
                  :
                  string
  ) {
    return await strapi.service('api::cart.cart').findOne(uuid)
  }
  ,
  async updateItems(cartId
                      :
                      string, cartItems
  ) {
    return await strapi.service('api::cart.cart').update(cartId, {
      data: {
        items: cartItems,
        sum: +(await this.getSumByItems(cartItems))
      }
    })
  }
  ,
  async addOrUpdateItem(cartUuid
                          :
                          string, data
  ) {
    const cart = await this.getCart(cartUuid)
    const existsItem = cart.items
      .find((item) => item.product.id === data.productId)

    if (existsItem && existsItem.quantity === data.quantity) {
      return cart
    }

    const cartItems = cart.items.map((cartItem) => {
      const quantity = cartItem.product.id === data.productId ? data.quantity : cartItem.quantity

      return {
        id: cartItem.id,
        __component: COMPONENT_NAME,
        quantity,
        product: cartItem.product.id
      }
    })

    if (!existsItem) {
      cartItems.push({
        __component: COMPONENT_NAME,
        quantity: data.quantity,
        product: data.productId
      })
    }

    return await this.updateItems(cart.id, cartItems)
  }
  ,
  async deleteItem(cartUuid
                     :
                     string, itemId
                     :
                     number
  ) {
    const cart = await this.getCart(cartUuid)
    const cartItems = cart.items
      .filter((cartItem) => {
        return cartItem.id !== +itemId
      })
      .map((cartItem) => {
        return {
          id: cartItem.id,
          __component: COMPONENT_NAME,
          quantity: cartItem.quantity,
          product: cartItem.product.id
        }
      })

    return await this.updateItems(cart.id, cartItems)
  }
}));
