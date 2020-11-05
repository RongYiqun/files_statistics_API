const { workerData, parentPort } = require('worker_threads');
const processFile = require('./utility/processFile');

parentPort.postMessage(processFile(workerData.filename, workerData.fileId));
