/**
 * order controller
 */

import {factories} from '@strapi/strapi'

export default factories.createCoreController('api::order.order', ({strapi}) => ({
    async orderStatusHook(ctx) {
      return await strapi.service('api::order.order').orderStatusHook(ctx)
    }
  })
);
