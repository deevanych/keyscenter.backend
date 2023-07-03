export default {
  myJob: {
    task: ({ strapi }) => {
      strapi.service('api::product-key.product-key').checkAvailability()
    },
    options: {
      rule: "* */12 * * *",
    },
  },
};
