/**
 * product service
 */

import { factories } from '@strapi/strapi';

const _url = (imageUrl: string) => new URL(imageUrl, process.env.BASE_URL)

const productWithReplacedImages = (product) => {
  if (product.images && typeof product.images !== 'undefined') {
    product.images = product.images.map((image) => {
      for (const format in image.formats) {
        image.formats[format] = {
          ...image.formats[format],
          url: _url(image.formats[format].url).href
        }
      }

      return {
        ...image,
        url: _url(image.url).href
      }
    })

    return product
  }
}

export default factories.createCoreService('api::product.product', ({ strapi }): {} => ({
  async findOne(id, params) {
    const product = await strapi.entityService.findOne('api::product.product', id, params)
    await strapi.entityService.update('api::product.product', id, {
      data: {
        views: +product.views + 1,
      },
      params
    })

    return productWithReplacedImages(product)
  }
}));

