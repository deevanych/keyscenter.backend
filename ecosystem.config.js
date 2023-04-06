module.exports = {
  apps : [{
    name   : "shop-backend",
    script : "npm run start",
    instances: 4,
    exec_mode: "cluster",
    env_production: {
      NODE_ENV: "production"
    },
    env_development: {
      NODE_ENV: "development"
    }
  }]
}
