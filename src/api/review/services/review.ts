/**
 * review service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::review.review', ({ strapi }) => ({
  async create (ctx) {
    const user = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: {
        email: ctx.data.email
      }
    })

    await strapi.db.query('api::review.review').create({
      data: {
        text: ctx.data.comment,
        user: user.id,
        product: ctx.data.product_id,
        is_positive: ctx.data.is_positive
      }
    })

    return await strapi.db.query('api::review.review').findMany({
      where: {
        product: ctx.data.product_id
      },
      select: ['text', 'is_positive', 'created_at'],
      orderBy: {
        createdAt: 'desc'
      }
    })
  }
}));
