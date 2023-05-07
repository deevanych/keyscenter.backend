const utils = require('@strapi/utils');
const {NotFoundError} = utils.errors;

export default (config, {strapi}) => {
  return async (ctx, next) => {
    const {productId, quantity} = ctx.request.body.data

    const product = await strapi.db.query('api::product.product').findOne({
      where: { id: productId },
      select: ['id'],
      populate: {
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

    if (!product) {
      throw new NotFoundError('Продукт не найден');
    }

    if (product.product_keys.length < quantity) {
      let errorText = 'Товар закончился'

      if (product.product_keys.length > 0) {
        errorText = `В наличии осталось: ${product.product_keys.length} штук`
      }

      throw new NotFoundError(errorText);
    }

    return next()
  };
};
