const winston = require("winston");

const customFormat = winston.format.printf(
  ({ level, message, label, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
  }
);

const createNewLogger = () => {
  return winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      customFormat
    ),
    defaultMeta: { service: "user-service" },
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: "combined.log" }),
    ],
  });
};

exports.createNewLogger = createNewLogger;
