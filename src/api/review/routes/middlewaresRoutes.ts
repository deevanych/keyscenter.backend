module.exports = {
  routes: [
    {
      method: "POST",
      path: "/reviews",
      handler: "api::review.review.create",
      config: {
        middlewares: ["api::review.check-user-product-order"],
      },
    },
  ],
};
