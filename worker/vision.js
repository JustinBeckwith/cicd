'use strict';

const axios = require('axios');
const uuid = require('uuid/v4');
const util = require('util');
const logger = require('./logger');
const gcperror = require('./gcperror');
const Vision = require('@google-cloud/vision');
const Storage = require('@google-cloud/storage');

const gconf = {
  keyFilename: 'keyfile.json'
};

const vision = new Vision.ImageAnnotatorClient(gconf);
const storage = new Storage(gconf);
const bucket = storage.bucket('cloudcats-bucket');

var count = 0;

async function annotate(url) {
  const name = uuid();
  const file = bucket.file(name);

  const res = await axios({
    url: url,
    responseType: 'stream'
  });
  if (!res.data) {
    throw new Error('Response failed to return data.');
  }

  await new Promise((resolve, reject) => {
    res.data
      .pipe(file.createWriteStream())
      .on('finish', () => {
        resolve();
      });
    });

  const labels = await vision.labelDetection(`gs://cloudcats-bucket/${name}`);
  file.delete();
  return {
    url: url,
    labels: labels[0].labelAnnotations.map(x => x.description)
  };
}

let api = {
  annotate: annotate
}

module.exports = api;