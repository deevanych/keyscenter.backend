module.exports = {
  apps : [{
    name   : "shop-backend",
    script : "./server.js",
    instances: 4,
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
