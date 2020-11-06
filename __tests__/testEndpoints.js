const app = require('../app');
const supertest = require('supertest');
const request = supertest(app);
const fs = require('fs');
const path = require('path');
const util = require('util');
const readFile = util.promisify(fs.readFile);

test('test upload endpoint', async (done) => {
  const response = await request
    .post('/upload')
    .attach('file', 'testData/testData_20201004_to_20201020.csv')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/);
  expect(response.status).toBe(201);
  expect(Object.keys(response.body).includes('fileId')).toBe(true);
  setTimeout(async () => {
    const fileId = response.body.fileId;
    const data = await readFile(`analytics/${fileId}.json`, 'utf8');
    expect(Object.keys(data).includes('average_traffic_pageview'));
    expect(Object.keys(data).includes('ratios_usr_session_per_day'));
    expect(Object.keys(data).includes('weekly_max_sessions'));
    done();
  }, 1000);
});

test('test upload endpoint with result', async (done) => {
  const response = await request
    .get('/analytics/file/3eb0a56a-31b1-46cd-8220-acf8d3b34271')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/);
  expect(response.status).toBe(200);
  expect(response.body.status).toBe('finished');
  const result = response.body.result;
  expect(Object.keys(result).includes('average_traffic_pageview'));
  expect(Object.keys(result).includes('ratios_usr_session_per_day'));
  expect(Object.keys(result).includes('weekly_max_sessions'));
  done();
});

test('test upload endpoint without result', async (done) => {
  const response = await request
    .get('/analytics/file/eaba143d-3879-40dc-ab10-86614835a6de')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/);
  expect(response.status).toBe(200);
  expect(response.body.status).toBe('processing');
  done();
});

test('test upload endpoint, file not even exit', async (done) => {
  const response = await request
    .get('/analytics/file/e7684ef0-5455-485d-b330-d3f42c2dc5bb')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/);
  expect(response.status).toBe(200);
  expect(response.body.message).toBe('file with this id not found');
  done();
});

afterAll((done) => {
  const testFilesInUploads = [
    '3eb0a56a-31b1-46cd-8220-acf8d3b34271.csv',
    'eaba143d-3879-40dc-ab10-86614835a6de.csv',
  ];
  const testFilesInAnalytics = ['3eb0a56a-31b1-46cd-8220-acf8d3b34271.json'];

  setTimeout(() => {
    removeFilesExcept('uploads', testFilesInUploads);
    removeFilesExcept('analytics', testFilesInAnalytics);
    done();
  }, 1000);
});

function removeFilesExcept(directory, excepts) {
  fs.readdir(directory, (err, files) => {
    if (err) throw err;
    for (let file of files) {
      if (!excepts.includes(file)) {
        fs.unlink(path.join(directory, file), (err) => {
          if (err) throw err;
        });
      }
    }
  });
}
