const parseDate = require('./parseDate');

test('invalid date', () => {
  expect(parseDate('2012-02-02')).toBe('invalid_date');
  expect(parseDate('2020/12/20')).toBe('invalid_date');
});

test('valid date', () => {
  expect(parseDate('20120202')).toEqual(new Date('2012-02-02'));
  expect(parseDate('20201202')).toEqual(new Date('2020-12-02'));
  expect(parseDate('20201106').getDay()).toEqual(5);
  expect(parseDate('20201101').getDay()).toEqual(0);
});
