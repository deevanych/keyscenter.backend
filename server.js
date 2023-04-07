const strapi = require('@strapi/strapi');

strapi({}).start().then(r => {
  process.send('ready')
  console.log('Instance is up!')
});
