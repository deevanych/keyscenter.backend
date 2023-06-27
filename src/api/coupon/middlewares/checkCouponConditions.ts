/**
 * `checkCouponConditions` middleware
 */

import { Strapi } from '@strapi/strapi';

export default (config, { strapi }: { strapi: Strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    strapi.log.info('In checkCouponConditions middleware.');

    await next();
  };
};
