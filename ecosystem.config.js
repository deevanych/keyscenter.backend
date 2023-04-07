module.exports = {
  apps : [{
    name   : "shop-backend",
    script : "./server.js",
    instances: process.env.INSTANCES_COUNT || -1,
    wait_ready: true,
    exec_mode: "cluster",
    env_production: {
      NODE_ENV: "production"
    },
    env_development: {
      NODE_ENV: "development"
    }
  }]
}
