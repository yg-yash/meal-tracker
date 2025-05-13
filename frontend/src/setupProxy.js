const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/auth',
    createProxyMiddleware({
      target: 'http://localhost:3000/api',
      changeOrigin: true,
    })
  );
  
  app.use(
    '/calories',
    createProxyMiddleware({
      target: 'http://localhost:3000/api',
      changeOrigin: true,
    })
  );
  
  app.use(
    '/meal-log',
    createProxyMiddleware({
      target: 'http://localhost:3000/api',
      changeOrigin: true,
    })
  );
};
