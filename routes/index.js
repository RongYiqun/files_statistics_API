var express = require('express');
var router = express.Router();
var path = require('path');
var upload = require('../utility/fileUpload');
const { Worker } = require('worker_threads');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);

/* GET home page. */
router.get('/', function (req, res, next) {
  res.json({ title: 'Express' });
});

router.post('/upload', upload.single('file'), (req, res, next) => {
  try {
    if (req.file) {
      var fileId = path.parse(req.file.filename).name;
      const worker = new Worker('./task.js', {
        workerData: { filename: `./uploads/${req.file.filename}`, fileId },
      });
      return res.status(201).json({ fileId });
    } else {
      return res.status(200).json({
        message: 'please upload a file',
      });
    }
  } catch (error) {
    console.error(error);
  }
});

router.get('/fileInfo/:fileId', async (req, res, next) => {
  const fileId = req.params.fileId;
  try {
    const data = await readFile(`analytics/${fileId}.json`, 'utf8');
    return res.status(200).json({
      status: 'finished',
      result: JSON.parse(data),
    });
  } catch (err) {
    fs.access(`uploads/${fileId}.csv`, fs.F_OK, function (err) {
      if (err) {
        return res.status(200).json({
          message: 'file not found',
        });
      } else {
        return res.status(200).json({
          status: 'processing',
        });
      }
    });
  }
});

module.exports = router;
