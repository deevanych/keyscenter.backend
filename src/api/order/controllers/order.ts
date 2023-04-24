/**
 * order controller
 */

import { factories } from '@strapi/strapi'
import { v4 as uuidv4 } from 'uuid';

export default factories.createCoreController('api::order.order', ({ strapi }) => ({
  async create(ctx) {
    const cartItems = ctx.request.body.items
    const keysIds = []
    const products = await strapi.entityService.findMany('api::product.product', {
      fields: ['sale_price'],
      filters: {
        $or: ctx.request.body.items.map((item) => { return { id: item.id } })
      },
    });

    for (const item of cartItems) {
      const keys = await strapi.entityService.findMany('api::product-key.product-key', {
        populate: ['order'],
        fields: [],
        filters: {
            product: item.id,
            published_at: { $notNull: true },
            order: null
        },
        limit: item.quantity,
      });

      if (keys.length < item.quantity) {
        ctx.res.end()
      }

      keysIds.push(...keys.map((key) => key.id))
    }

    const updatedKeysCount = await strapi.db.query('api::product-key.product-key').updateMany({
      where: {
        $or: keysIds.map((id: number) => {
          return { id }
        })
      },
      data: {
        publishedAt: '2023-04-24 01:08:03.382000'
      }
    })

    if (updatedKeysCount.count !== keysIds.length) {
      ctx.res.end()
    }

    let user = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: {
        email: ctx.request.body.email
      }
    })

    if (!user) {
      user = await strapi.db.query('plugin::users-permissions.user').create({
        data: {
          username: ctx.request.body.email,
          email: ctx.request.body.email
        }
      })
    }

    const orderSum = ctx.request.body.items.reduce((sum, item) => {
      const product = products.find((_product) => _product.id === item.id)

      return product.salePrice * item.quantity + sum
    }, 0)

    const order = await strapi.entityService.create('api::order.order', {
      data: {
        order_uuid: uuidv4(),
        products: ctx.request.body.items.map((item) => item.id),
        product_keys: keysIds,
        users_permissions_user: user.id,
        sum: orderSum
      }
    })

    return order
  }
})
);
