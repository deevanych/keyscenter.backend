/**
 * product controller
 */
// @ts-nocheck
import { factories } from '@strapi/strapi'
import {up} from "inquirer/lib/utils/readline";
export default factories.createCoreController('api::product.product', ({ strapi }) => ({
    async findOne(ctx) {
      const { id: slug } = ctx.params;
      const { query } = ctx;

      const entity = await strapi.db.query('api::product.product').findOne({
        where: { slug },
        ...query
      });

      const updatedEntity = await strapi.db.query('api::product.product').update({
        where: {slug},
        data: {
          views: +entity.views + 1
        }
      })

      entity.views = updatedEntity.views

      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

      return this.transformResponse(sanitizedEntity);
    }
})
);
