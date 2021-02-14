import readline from 'readline';

export const readLineFromConsole = (
  invitationText: string,
  callback: (answer: string) => void,
): void => {
  const readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  readlineInterface.question(invitationText, answerText => {
    callback(answerText);
    readlineInterface.close();
  });
};
