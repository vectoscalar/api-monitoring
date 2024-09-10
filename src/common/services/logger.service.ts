import pino from "pino";

export class Logger {
  logger: any;
  level: any;

  constructor() {
    this.level = "info";
    this.init(this.level);
  }

  init(level: any) {
    try {
      this.logger = pino({
        name: "ApiMonitor",
        level,
        redact: ["req.headers.authorization"],
        serializers: {
          res(reply: any) {
            // The default
            return {
              statusCode: reply.statusCode,
            };
          },
          req(request: any) {
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
    } catch (err: any) {
      console.log("failed to init logger", err);
    }
  }

  info(...message: any[]) {
    this.logger.info(message);
  }

  error(...error: any[]) {
    this.logger.error(error);
  }

  warn(...message: any[]) {
    this.logger.warn(message);
  }

  trace(...message: any[]) {
    this.logger.trace(message);
  }

  getLevel() {
    return this.level;
  }
}

export const logger = new Logger();
