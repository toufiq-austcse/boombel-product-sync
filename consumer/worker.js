const { Consumer } = require('sqs-consumer');
let AWS = require('aws-sdk');
let fs = require('fs');
let axios = require('axios');
const { parentPort, workerData } = require('worker_threads');
const QUEUE_URL = `https://sqs.ap-southeast-1.amazonaws.com/584482757797/products`;
let AWSAccessKeyId = 'AKIAYQFPDDSSQ76MLM4Y';
let AWSSecretKey = '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';

function delay(timeInMs) {
  return new Promise((resolve) => setTimeout(resolve, timeInMs));
}

async function postToBoombel(modifiedData) {
  try {
    let res = await axios.post('https://boombel.eu/wp-json/wc/v3/products', modifiedData, {
      auth: {
        username: `ck_380d746b8f0878e48bec98d831906c907ab4d8df`,
        password: `cs_2ed49a196bc9f0da900c23617a8a251218f4d462`,
      },
    });
  } catch (error) {
    if (error.response?.data?.data?.status === 400) {
      console.log('400 error');
    } else {
      console.log('error in posting boombel', error.response.data);
      throw new Error(error);
    }
  }
}

AWS.config.update({
  region: 'ap-southeast-1',
  accessKeyId: AWSAccessKeyId,
  secretAccessKey: AWSSecretKey,
});

const app = Consumer.create({
  queueUrl: QUEUE_URL,
  sqs: new AWS.SQS(),
  batchSize: 10,
  waitTimeSeconds: 20,
  pollingWaitTimeMs: 5 * 1000,
  handleMessageBatch: async (messages) => {
    // do some work with `message`
    if (messages.length > 0) {
      for (let message of messages) {
        try {
          await postToBoombel(JSON.parse(message.Body));
          parentPort.postMessage(1);
        } catch (error) {
          console.log('Error ', error);
          throw new Error(error);
        }
      }
    }
  },
});

app.on('error', (err) => {
  console.error(err.message);
});

app.on('processing_error', (err) => {
  console.error(err.message);
});

app.start();
console.log('consumer started');
