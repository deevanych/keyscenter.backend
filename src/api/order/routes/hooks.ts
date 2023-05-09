export default {
  routes: [
    { // Path defined with a regular expression
      method: 'POST',
      path: '/orders/status', // Only match when the first parameter contains 2 or 3 digits.
      handler: 'order.orderStatusHook',
    }
  ]
}
