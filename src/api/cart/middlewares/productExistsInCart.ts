import {errors} from '@strapi/utils'

const {NotFoundError} = errors;

export default (config, {strapi}) => {
  return async (ctx, next) => {
    const cart = await strapi.db.query('api::cart.cart').findOne({
      where: {
        uuid: ctx.params.cartId
      },
      populate: {
        items: {
          select: ['id']
        }
      }
    })

    if (!cart.items.find((item) => item.id === +ctx.params.itemId)) {
      throw new NotFoundError('Продукт отсутствует в корзине')
    }

    return await next()
  }
}
