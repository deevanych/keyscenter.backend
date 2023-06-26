export default {
  routes: [
    { // Path defined with a regular expression
      method: 'POST',
      path: '/carts/:cartId/coupons', // Only match when the first parameter contains 2 or 3 digits.
      handler: 'coupon.apply',
    },
    { // Path defined with a regular expression
      method: 'DELETE',
      path: '/carts/:cartId/coupons', // Only match when the first parameter contains 2 or 3 digits.
      handler: 'coupon.cancel',
    }
  ]
}
