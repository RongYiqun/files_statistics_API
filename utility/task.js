const { workerData } = require('worker_threads');
const { processFile } = require('./processFile');

processFile(workerData.filename, workerData.fileId).catch((err) => {
  console.log(err);
});
