/**
 * page controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::page.page', ({ strapi }) => ({
  async findOne(ctx) {
    const { id: slug } = ctx.params

    return strapi.db.query('api::page.page').findOne({
      where: {
        slug
      }
    })
  }
}));
