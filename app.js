const express = require("express");
const minimist = require("minimist");

const AxiosRequester = require("./axiosRequester");
const killApp = require("./appKiller");
const {
  parseActivities,
  getNewestActivities,
  accumulateActivities,
  filterActivities,
} = require("./activitiesParser");
const testData = require("./testData");
const app = express();

const args = minimist(process.argv.slice(2));

const oldActivities = parseActivities(testData.testData);
const newActivities = parseActivities(testData.testDataNew);

const newestActivities = getNewestActivities({ oldActivities, newActivities });

const accumulationSet = accumulateActivities({
  activities: oldActivities,
  keyField: "athlete",
  accumulateFields: ["distance", "movingTime"],
});

const filteredActivitiesString = filterActivities({
  activities: newActivities,
  filterField: "type",
  filterValue: "Run",
});

const filteredActivitiesRegex = filterActivities({
  activities: newActivities,
  filterField: "type",
  filterValue: /Walk|Run/,
});

if (!args.token) {
  killApp({ exitCode: 9, consoleLog: "Missing --token param" });
}

if (!args.clubId) {
  killApp({ exitCode: 9, consoleLog: "Missing --clubId param" });
}

const axiosInstance = new AxiosRequester(args.token);

app.get("/", (req, res) => {
  res.send(`Hi!`);
});

app.get("/club", (req, res) => {
  axiosInstance
    .callGet(`clubs/${args.clubId}/activities`)
    .then((stravaRes) => {
      console.log(stravaRes.data);
      res.send(stravaRes.data);
    })
    .catch((error) => {
      console.error(error.message);
      if (error.response.status === 401) {
        killApp({ exitCode: 0 });
      }
      res.send(`Ooops... ` + error.message);
    });
});

const server = app.listen(3000, () => {
  console.log("Server ready");
});

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Process terminated");
  });
});
