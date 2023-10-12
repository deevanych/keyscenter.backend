import type { Schema, Attribute } from '@strapi/strapi';

export interface CartItem extends Schema.Component {
  collectionName: 'components_cart_items';
  info: {
    displayName: 'Item';
    description: '';
  };
  attributes: {
    product: Attribute.Relation<
      'cart.item',
      'oneToOne',
      'api::product.product'
    >;
    quantity: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<{
        min: 1;
      }> &
      Attribute.DefaultTo<1>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'cart.item': CartItem;
    }
  }
}
