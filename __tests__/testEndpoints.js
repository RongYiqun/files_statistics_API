const app = require('../app');
const supertest = require('supertest');
const request = supertest(app);

test('test upload endpoint', async (done) => {
  const response = await request
    .post('/upload')
    .attach('file', 'testData/testData_20201004_to_20201020.csv')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/);
  expect(response.status).toBe(201);
  expect(Object.keys(response.body).includes('fileId')).toBe(true);
  done();
});

test('test upload endpoint with result', async (done) => {
  const response = await request
    .get('/analytics/file/227a3fd7-e7ba-4303-a385-928778f5fd84')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/);
  expect(response.status).toBe(200);
  expect(response.body.status).toBe('finished');
  expect(
    Object.keys(response.body.result).includes('average_traffic_pageview'),
  );
  expect(
    Object.keys(response.body.result).includes('ratios_usr_session_per_day'),
  );
  expect(Object.keys(response.body.result).includes('weekly_max_sessions'));
  done();
});

test('test upload endpoint without result', async (done) => {
  const response = await request
    .get('/analytics/file/30322471-1ee2-419c-b2a4-b0d11e416ee2')
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
