module.exports = {
  apps: [{
    name: 'jewelry-shop',
    script: 'src/server.js',
    watch: false,
    max_memory_restart: '300M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
