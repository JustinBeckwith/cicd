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

const Hapi = require('hapi');
const path = require('path');
const relay = require('./catrelay');
const logger = require('./logger');

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

// Set up the server
const server = new Hapi.Server({
  host: '0.0.0.0',
  port: process.env.PORT || 8080
});

// Set up socket.io
const io = require('socket.io')(server.listener, {
  transports: ['polling']
});

async function main() {
  await server.register([require('vision'), require('inert')]);

  // configure jade views
  server.views({
    engines: { pug: require('pug') },
    path: __dirname + '/templates',
    compileOptions: {
        pretty: true
    }
  });

  // set up static public handler
  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: 'public'
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return h.view('index');
    }
  });

  // start the server
  await server.start();
  logger.info('Server running at:', server.info.uri);

  // start listening for cats
  relay.listen(io);
}

main();