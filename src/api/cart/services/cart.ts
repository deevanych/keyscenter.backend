/**
 * cart service
 */

// @ts-nocheck

import {factories} from '@strapi/strapi';
import {v4} from 'uuid';

const COMPONENT_NAME = 'cart.item'

export default factories.createCoreService('api::cart.cart', ({strapi}) => ({
  async create(params) {
    params.data.uuid = v4()

    return await super.create(params)
  },
  async addOrUpdateItem(cartUuid: string, data) {
    const existsCart = await strapi.db.query('api::cart.cart').findOne({
      where: {
        uuid: cartUuid
      },
      populate: {
        items: {
          populate: {
            product: {
              select: ['id', 'salePrice', 'price']
            }
          }
        }
      },
      select: ['id', 'sum']
    })

    const existsItem = existsCart.items.find((item) => item.product.id === data.productId)

    if (existsItem && existsItem.quantity === data.quantity) {
      return existsCart
    }

    const cartItems = existsCart.items.map((cartItem) => {
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

    return await strapi.entityService.update('api::cart.cart', existsCart.id, {
      data: {
        items: cartItems
      },
      fields: ['id', 'sum'],
      populate: {
        items: {
          populate: {
            product: {
              fields: ['id', 'salePrice', 'price']
            }
          }
        }
      }
    })
  },
  async deleteItem(cartUuid: string, itemId: number) {
    const existsCart = await strapi.db.query('api::cart.cart').findOne({
      where: {
        uuid: cartUuid
      },
      populate: {
        items: {
          populate: {
            product: {
              select: ['id', 'salePrice', 'price']
            }
          }
        }
      },
      select: ['id', 'sum'],
    })

    const cartItems = existsCart.items
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

    return await strapi.entityService.update('api::cart.cart', existsCart.id, {
      data: {
        items: cartItems
      },
      fields: ['id', 'sum'],
      populate: {
        items: {
          populate: {
            product: {
              fields: ['id', 'salePrice', 'price']
            }
          }
        }
      }
    })
  }
}));
