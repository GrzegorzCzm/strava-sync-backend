const killApp = ({ exitCode = 0, consoleLog = "Oppsss.." }) => {
  console.error(consoleLog);
  process.exit(exitCode);
};

const handleError = ({ responseStatus, message, response }) => {
  console.error(message);
  if (responseStatus === 401) {
    killApp({ exitCode: 0 });
  }
  response.send(`Ooops... ` + error.message);
};

exports.killApp = killApp;
exports.handleError = handleError;
