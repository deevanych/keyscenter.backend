export default {
  routes: [
    {
      method: 'POST',
      path: '/carts/:cartId/items',
      handler: 'cart.addOrUpdateItem',
      config: {
        middlewares: ['api::cart.check-product-availability']
      }
    },
    {
      method: 'DELETE',
      path: '/carts/:cartId/items/:itemId',
      handler: 'cart.deleteItem',
      config: {
        middlewares: ['api::cart.product-exists-in-cart']
      }
    },
  ]
}
