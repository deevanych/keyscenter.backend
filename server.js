const strapi = require('@strapi/strapi');

const start = async () => {
  await strapi({ distDir: './dist' }).start()
  process.send('ready')
  console.log('Instance is up!')
}

start()
