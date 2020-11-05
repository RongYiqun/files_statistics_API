const csv = require('csv-parser');
const fs = require('fs');
const parseDate = require('./parseDate');

function processFile(fileName, fileId) {
  console.log('processFile!!!');
  const dateMap = new Map();

  fs.createReadStream(fileName)
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
      const entries = Array.from(dateMap.entries());
      //   console.log(Object.fromEntries(dateMap));
      entries.sort((a, b) => {
        //sort array accounting to date
        return parseDate(a[0]) - parseDate(b[0]);
      });

      const weekly_max_sessions_results = [];
      const ratios_usr_session_per_day = [];
      const trafficTypePageViewCount = {};
      let weekly_max_sessions = {};
      let isWeekStarted = false;
      let week_start_from = null;
      for (let [dateString, rows] of entries) {
        const trafficTypeSessionCount = {};
        const currentDate = parseDate(dateString);
        let numberOfUser = 0;
        let numberOfSession = 0;
        for (let row of rows) {
          numberOfUser += Number(row['Users']);
          numberOfSession += Number(row['Sessions']);

          if (trafficTypePageViewCount[row['Traffic Type']]) {
            trafficTypePageViewCount[row['Traffic Type']] += Number(
              row['Pageviews'],
            );
          } else {
            trafficTypePageViewCount[row['Traffic Type']] = Number(
              row['Pageviews'],
            );
          }

          if (trafficTypeSessionCount[row['Traffic Type']]) {
            trafficTypeSessionCount[row['Traffic Type']] += Number(
              row['Sessions'],
            );
          } else {
            trafficTypeSessionCount[row['Traffic Type']] = Number(
              row['Sessions'],
            );
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
          weekly_max_sessions_results.push({
            [week_start_from]: weekly_max_sessions,
          });
          isWeekStarted = false;
          weekly_max_sessions = {};
          week_start_from = null;
        }

        ratios_usr_session_per_day.push({
          [dateString]: numberOfUser / numberOfSession,
        });
      }

      const numberOfDays = entries.length;
      const average_traffic_pageview = {};
      for (let traffic in trafficTypePageViewCount) {
        average_traffic_pageview[traffic] =
          trafficTypePageViewCount[traffic] / numberOfDays;
      }

      const result = {
        average_traffic_pageview,
        ratios_usr_session_per_day,
        weekly_max_sessions: weekly_max_sessions_results,
      };

      try {
        fs.writeFile(
          `./analytics/${fileId}.json`,
          JSON.stringify(result),
          function (err, file) {
            if (err) throw err;
          },
        );
      } catch (err) {}
    });
}

module.exports = processFile;
