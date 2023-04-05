module.exports = {
  apps : [{
    name   : "shop-backend",
    script : "npm",
    instances: 4,
    env_production: {
      NODE_ENV: "production"
    },
    env_development: {
      NODE_ENV: "development"
    }
  }]
}
