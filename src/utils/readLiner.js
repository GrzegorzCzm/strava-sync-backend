const readline = require("readline");

const readLineFromConsole = (invitationText, callback) => {
  const readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  readlineInterface.question(invitationText, (answerText) => {
    callback(answerText);
    readlineInterface.close();
  });
};

module.exports = readLineFromConsole;
