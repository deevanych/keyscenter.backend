/**
 * product service
 */

// @ts-nocheck

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::product.product",
  ({ strapi }) => ({
    async find() {
      const results = await strapi.db.query("api::product.product").findMany({
        select: ["title", "price", "description", "salePrice", "slug"],
        populate: {
          images: {
            select: ["formats"],
          },
          reviews: {
            select: ["text", "is_positive", "created_at"],
          },
          product_category: {
            select: ["slug", "title", "id"],
          },
          product_keys: {
            select: ["id"],
            where: {
              $and: [
                {
                  published_at: {
                    $notNull: true,
                  },
                },
              ],
            },
          },
        },
      });

      return { results };
    },
    async findOne(slug: string, params: { populate: any }) {
      return await strapi.db.query("api::product.product").findOne({
        ...params,
        where: { slug },
        select: [
          "title",
          "price",
          "salePrice",
          "slug",
          "description",
          "activation_by_phone",
          "download_link",
        ],
        populate: {
          instruction_page: {
            select: ["slug"],
          },
          images: {
            select: ["formats"],
          },
          reviews: {
            orderBy: {
              createdAt: "desc",
            },
            where: {
              publishedAt: {
                $notNull: true,
              },
            },
            select: ["text", "is_positive", "created_at"],
          },
          product_category: {
            select: ["slug", "title"],
          },
          product_type: {
            select: ["title"],
          },
          product_keys: {
            select: ["id"],
            where: {
              $and: [
                {
                  published_at: {
                    $notNull: true,
                  },
                },
              ],
            },
          },
        },
      });
    },
  })
);
