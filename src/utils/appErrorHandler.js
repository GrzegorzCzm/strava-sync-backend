const killApp = ({ exitCode = 0 }) => {
  process.exit(exitCode);
};

const handleError = ({ responseStatus, message, response }) => {
  if (responseStatus === 401) {
    killApp({ exitCode: 0 });
  }
  response.send(`Ooops... ` + error.message);
};

exports.killApp = killApp;
exports.handleError = handleError;
