import pino from "pino";
export class Logger {
  logger;
  level;
  constructor() {
    this.level = "info";
    this.init(this.level);
  }
  init(level) {
    try {
      this.logger = pino({
        name: "ApiMonitor",
        level,
        redact: ["req.headers.authorization"],
        serializers: {
          res(reply) {
            // The default
            return {
              statusCode: reply.statusCode,
            };
          },
          req(request) {
            return {
              method: request.method,
              url: request.url,
              path: request.routerPath,
              parameters: request.params,
              headers: request.headers,
            };
          },
        },
      });
      this.level = level;
    } catch (err) {
      console.log("failed to init logger", err);
    }
  }
  info(...message) {
    this.logger.info(message);
  }
  error(...error) {
    this.logger.error(error);
  }
  warn(...message) {
    this.logger.warn(message);
  }
  trace(...message) {
    this.logger.trace(message);
  }
  getLevel() {
    return this.level;
  }
}
export const logger = new Logger();
