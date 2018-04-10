'use strict';

require('@google-cloud/trace-agent').start({
  keyFilename: './keyfile.json',
  projectId: 'cloudcats-next'
});

require('@google-cloud/debug-agent').start({
  allowExpressions: true,
  keyFilename: './keyfile.json',
  projectId: 'cloudcats-next'
});

const analyzer = require('./analyzer');
const logger = require('./logger');
const grpc = require('grpc');
const proto = grpc.load('cloudcats.proto').cloudcats;

const server = new grpc.Server();
server.addService(proto.Worker.service, {
  analyze: (call) => {
    analyzer.analyze(call)
      .then(result => {
        logger.info("Request complete. Ending streaming response.");
        call.end();
      }).catch(err => {
        logger.error('Error analyzing reddit');
        logger.error(err);
        call.end();
      });
  }
});
server.bind('0.0.0.0:8081', grpc.ServerCredentials.createInsecure());
server.start();
