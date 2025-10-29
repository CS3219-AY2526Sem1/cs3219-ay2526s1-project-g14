// // frontend/src/setupProxy.js
// const { createProxyMiddleware } = require('http-proxy-middleware');

// module.exports = function (app) {
//   const target = 'http://localhost:5050';

//   const stripCookies = {
//     target,
//     changeOrigin: true,
//     onProxyReq(proxyReq) {
//       proxyReq.removeHeader('cookie');
//     },
//   };
//   app.use('/ai', createProxyMiddleware(stripCookies));
// };


const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  const target = 'http://localhost:5050';

  app.use(
    '/ai',
    createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: (path) => `/ai${path}`,
      onProxyReq(proxyReq) {
        proxyReq.removeHeader('cookie');
      },
    })
  );
};
