const csv = require('csv-parser');
const fs = require('fs');
const parseDate = require('./parseDate');

function computeAverageTrafficPageview(dateEntries) {
  const trafficTypePageViewCount = {};
  for (let [dateString, rows] of dateEntries) {
    for (let row of rows) {
      if (trafficTypePageViewCount[row['Traffic Type']]) {
        trafficTypePageViewCount[row['Traffic Type']] += Number(
          row['Pageviews'],
        );
      } else {
        trafficTypePageViewCount[row['Traffic Type']] = Number(
          row['Pageviews'],
        );
      }
    }
  }
  const numberOfDays = dateEntries.length;
  const average_traffic_pageview = {};
  for (let traffic in trafficTypePageViewCount) {
    average_traffic_pageview[traffic] =
      trafficTypePageViewCount[traffic] / numberOfDays;
  }
  return average_traffic_pageview;
}

function computeRatiosUserSessionPerDay(dateEntries) {
  const ratios_usr_session_per_day = {};
  for (let [dateString, rows] of dateEntries) {
    let numberOfUser = 0;
    let numberOfSession = 0;
    for (let row of rows) {
      numberOfUser += Number(row['Users']);
      numberOfSession += Number(row['Sessions']);
    }
    ratios_usr_session_per_day[dateString] = numberOfUser / numberOfSession;
  }
  return ratios_usr_session_per_day;
}

function computeWeeklyMaxSessions(dateEntries) {
  const weekly_max_sessions_results = {};
  let weekly_max_sessions = {};
  let isWeekStarted = false;
  let week_start_from = null;
  for (let [dateString, rows] of dateEntries) {
    const trafficTypeSessionCount = {};
    const currentDate = parseDate(dateString);
    for (let row of rows) {
      if (trafficTypeSessionCount[row['Traffic Type']]) {
        trafficTypeSessionCount[row['Traffic Type']] += Number(row['Sessions']);
      } else {
        trafficTypeSessionCount[row['Traffic Type']] = Number(row['Sessions']);
      }
    }

    if (!isWeekStarted) {
      if (currentDate.getDay() == 0) {
        isWeekStarted = true;
        week_start_from = dateString;
      }
    }

    if (isWeekStarted) {
      for (let traffic in trafficTypeSessionCount) {
        if (weekly_max_sessions[traffic]) {
          weekly_max_sessions[traffic] = Math.max(
            weekly_max_sessions[traffic],
            trafficTypeSessionCount[traffic],
          );
        } else {
          weekly_max_sessions[traffic] = trafficTypeSessionCount[traffic];
        }
      }
    }

    if (currentDate.getDay() == 6) {
      weekly_max_sessions_results[week_start_from] = weekly_max_sessions;
      isWeekStarted = false;
      weekly_max_sessions = {};
      week_start_from = null;
    }
  }
  return weekly_max_sessions_results;
}

function processFile(fileName, fileId) {
  return new Promise((resolve, reject) => {
    const dateMap = new Map();
    const fileStream = fs.createReadStream(fileName);
    fileStream.on('error', function (err) {
      reject(err);
    });

    fileStream
      .pipe(csv())
      .on('data', (data) => {
        const date = data.Date;
        if (dateMap.has(date)) {
          //construct hashmap (date, [row])
          dateMap.get(date).push(data);
        } else {
          dateMap.set(date, [data]);
        }
      })
      .on('end', () => {
        const dateEntries = Array.from(dateMap.entries());
        // console.log(Object.fromEntries(dateMap));
        dateEntries.sort((a, b) => {
          return parseDate(a[0]) - parseDate(b[0]);
        });

        const result = {
          average_traffic_pageview: computeAverageTrafficPageview(dateEntries),
          ratios_usr_session_per_day: computeRatiosUserSessionPerDay(
            dateEntries,
          ),
          weekly_max_sessions: computeWeeklyMaxSessions(dateEntries),
        };

        fs.writeFile(
          `./analytics/${fileId}.json`,
          JSON.stringify(result),
          function (err, file) {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          },
        );
      });
  });
}

module.exports = {
  processFile,
  computeAverageTrafficPageview,
  computeRatiosUserSessionPerDay,
  computeWeeklyMaxSessions,
};
