const killApp = ({ exitCode = 0, consoleLog = "Oppsss.." }) => {
  console.error(consoleLog);
  process.exit(exitCode);
};

module.exports = killApp;
