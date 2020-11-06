const dateEntries1 = require('../testData/testData_computeAverageTrafficPageview');
const dateEntries2 = require('../testData/testData_computeWeeklyMaxSessions');
const fs = require('fs');
const uuid = require('uuid');
const util = require('util');
const readFile = util.promisify(fs.readFile);

const {
  computeAverageTrafficPageview,
  computeRatiosUserSessionPerDay,
  computeWeeklyMaxSessions,
  processFile,
} = require('./processFile');

test('test computeAverageTrafficPageview', () => {
  const result = computeAverageTrafficPageview(dateEntries1);
  expect(result['referral']).toBeCloseTo(44, 5);
  expect(result['email']).toBeCloseTo(1, 5);
  expect(result['social']).toBeCloseTo(0.5, 5);
  expect(result['organic']).toBeCloseTo(261, 5);
});

test('test computeRatiosUserSessionPerDay', () => {
  const result = computeRatiosUserSessionPerDay(dateEntries1);
  expect(result['20201101']).toBeCloseTo(1, 5);
  expect(result['20201102']).toBeCloseTo(0.9202898550724637, 5);
});

test('test computeWeeklyMaxSessions', () => {
  const result = computeWeeklyMaxSessions(dateEntries2);
  expect(Object.keys(result).length).toBe(1);
  expect(result['20201101']['referral']).toBe(45);
  expect(result['20201101']['email']).toBe(28);
});

test('test processFile success', async () => {
  const fileId = uuid.v4();
  await processFile('testData/testData_20201004_to_20201020.csv', fileId);
  const dataString = await readFile(`analytics/${fileId}.json`, 'utf8');
  const data = JSON.parse(dataString);
  expect(Object.keys(data).length).toBe(3);
  expect(data['average_traffic_pageview']['paid']).toBeCloseTo(20);
  expect(data['average_traffic_pageview']['organic']).toBeCloseTo(315.8823529);
  expect(data['average_traffic_pageview']['referral']).toBeCloseTo(55.645);

  expect(data['ratios_usr_session_per_day']['20201004']).toBeCloseTo(
    0.962765957,
  );
  expect(data['ratios_usr_session_per_day']['20201011']).toBeCloseTo(
    0.947674419,
  );
  expect(data['ratios_usr_session_per_day']['20201018']).toBeCloseTo(
    0.964285714,
  );

  expect(data['weekly_max_sessions']['20201004']['organic']).toBe(307);
  expect(data['weekly_max_sessions']['20201004']['paid']).toBe(8);
  expect(data['weekly_max_sessions']['20201011']['direct']).toBe(85);
  expect(data['weekly_max_sessions']['20201011']['referral']).toBe(44);
});

test('test processFile fail', async () => {
  const fileId = uuid.v4();
  await expect(
    processFile('testData/helloWorld.csv', fileId),
  ).rejects.toThrow();
});
