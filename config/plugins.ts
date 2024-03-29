export default () => ({
  "content-versioning": {
    enabled:  true,
  },
  redis: {
    enabled: +process.env.CACHE_IS_ENABLED,
    config: {
      connections: {
        default: {
          connection: {
            host: '127.0.0.1',
            port: 6379,
            db: 0,
          },
          settings: {
            debug: true,
          },
        },
      },
    },
  },
  "rest-cache": {
    enabled: +process.env.CACHE_IS_ENABLED,
    config: {
      provider: {
        name: "redis",
        options: {
          max: 32767,
          connection: "default",
        },
      },
      strategy: {
        enableEtag: true,
        enableXCacheHeaders: true,
        resetOnStartup: true,
        hitpass: false,
        keysPrefix: process.env.DOPPLER_ENVIRONMENT,
        contentTypes: [
          "api::product.product"
        ],
        debug: true
      },
    },
  },
})
