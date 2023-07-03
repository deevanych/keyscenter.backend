/**
 * product-key service
 */

import { factories } from '@strapi/strapi';
import FormData from "form-data";
import axios from "axios";

const availableKeysStatuses = [
  '0xC004C008'
]

export default factories.createCoreService('api::product-key.product-key', ({ strapi }) => ({
  async checkAvailability () {
    const keys = await strapi.db.query('api::product-key.product-key').findMany({
      select: ['id', 'key']
    })
    const availableKeys: string[] = []
    const unavailableKeys: string[] = []
    let publishedKeysCount = 0

    try {
      const { data } = await this.keyAvailabilityRequest(keys.map(key => key.key))

      if (data.success) {
        data.data.forEach((keyResult) => {
          if (availableKeysStatuses.includes(keyResult.errorCode)) {
            availableKeys.push(keyResult.key)
          } else {
            unavailableKeys.push(keyResult.key)
          }
        })
      }
    } catch (e) {
      return e
    }

    if (availableKeys.length > 0) {
      const publishedKeys = await strapi.db.query('api::product-key.product-key').updateMany({
        where: {
          $or: availableKeys.map((key) => {
            return {
              key
            }
          })
        },
        select: ['id'],
        data: {
          publishedAt: new Date()
        }
      })

      publishedKeysCount = publishedKeys.count
    }

    if (unavailableKeys.length > 0) {
      await strapi.db.query('api::product-key.product-key').updateMany({
        where: {
          $or: unavailableKeys.map((key) => {
            return {
              key
            }
          })
        },
        select: ['id'],
        data: {
          publishedAt: null
        }
      })
    }

    return 'success'
  },
  async keyAvailabilityRequest (key: string | string[]) {
    let keysData = key
    if (keysData.constructor === Array) {
      keysData = keysData.join(',')
    }

    const data = new FormData();
    data.append('action', 'getkichhoat24h');
    data.append('type', '0');
    data.append('data', keysData);

    const config = {
      method: 'POST',
      maxBodyLength: Infinity,
      url: 'https://softcomputers.org/wp-admin/admin-ajax.php',
      data : data,
      timeout: 20000
    };

    return axios.request(config)
  }
}));
