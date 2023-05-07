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
      method: 'POST',
      path: '/carts/:cartId/check-availability',
      handler: 'cart.checkAvailability'
    },
    { // Path defined with a regular expression
      method: 'POST',
      path: '/carts/status', // Only match when the first parameter contains 2 or 3 digits.
      handler: 'cart.orderStatusHook',
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
