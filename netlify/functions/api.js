const serverless = require('serverless-http');
const app = require('../../index.js');

const handler = serverless(app);

module.exports.handler = async (event, context) => {
  // Set CORS headers for serverless environment
  const response = await handler(event, context);
  
  if (response.headers) {
    response.headers['Access-Control-Allow-Origin'] = '*';
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH';
    response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma';
    response.headers['Access-Control-Allow-Credentials'] = 'true';
  }
  
  return response;
};
