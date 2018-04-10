'use strict';

const reddit = require('./reddit');
const vision = require('./vision');
const util = require('util');
const async = require('async');
const logger = require('./logger');
const bigquery = require('@google-cloud/bigquery')({
  keyFilename: 'keyfile.json'
});
const dataset = bigquery.dataset('cloudcats');
const table = dataset.table('images');

const PostType = {
  CAT: 0,
  DOG: 1,
  NEITHER: 2,
  BOTH: 3
};

async function publishToBigQuery (data) {
  try {
    await table.insert(data);
  } catch (e) {
    logger.error(`error publishing to bigquery: ${util.inspect(e)}\n\t${e.stack}`);
  }
}

async function publishEvent (result, call) {
  let type = PostType.NEITHER;
  const containsDog = result.labels.indexOf('dog') > -1;
  const containsCat = result.labels.indexOf('cat') > -1;

  if (containsCat && !containsDog) {
    type = PostType.CAT;
  } else if (containsDog && !containsCat) {
    type = PostType.DOG;
  } else if (containsCat && containsDog) {
    type = PostType.BOTH;
  }

  let data = {
    url: result.url,
    type: type
  };

  // async publish data to big query
  publishToBigQuery(data);

  // write out to the gRPC streaming response
  call.write(data);
}

async function analyzeImage (url, call) {
  try {
    logger.info('processing ' + url);
    const visionResult = await vision.annotate(url);
    const evt = await publishEvent(visionResult, call);
    return evt;
  } catch (e) {
    logger.error('Error processing image');
    logger.error(e);
  }
}

async function analyze (call) {
  return new Promise((resolve, reject) => {
    logger.info('Starting to analyze!');
    let cnt = 0;
    const ai = util.callbackify(analyzeImage);
    reddit.getImageUrls().then(urls => {
      const q = async.queue((url, callback) => {
        ai(url, call, (err, evt) => {
          if (!err) {
            cnt++;
            logger.info(`${cnt} objects complete`);
          }
          callback(err);
        });
      }, 15);
      q.push(urls);
      q.drain = () => {
        logger.info('***all items have been processed***');
        resolve();
      };
    }).catch(e => {
      reject(e);
    });
  });
}

module.exports = {
  analyze: analyze
};
