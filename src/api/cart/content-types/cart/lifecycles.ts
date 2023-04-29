export default {
  async beforeUpdate(event) {
    const {where, data} = event.params

    const cart = await strapi.entityService.findOne('api::cart.cart', where.id, {
      populate: {
        items: {
          fields: ['id', 'quantity'],
          populate: {
            product: {
              fields: ['id', 'salePrice']
            }
          }
        }
      }
    })

    data.sum = cart.items.reduce((sum, item) => {
      return sum + item.product.salePrice * item.quantity
    }, 0)
  }
}
