import { createLogger, format, transports, Logger } from "winston";
import { SPLAT } from "triple-beam";
import { DateTime } from "luxon";
import { inspect } from "util";

export class LoggerUtil {
  public static getLogger(label: string): Logger {
    return createLogger({
      format: format.combine(
        format.label(),
        format.colorize(),
        format.label({ label }),
        format.printf((info) => {
          // SPLATフィールドが存在するか確認し、配列型として扱う
          const splatArgs = info[SPLAT] as unknown as any[] | undefined;

          if (splatArgs) {
            if (splatArgs.length === 1 && splatArgs[0] instanceof Error) {
              const err = splatArgs[0] as Error;
              if (
                typeof info.message === "string" &&
                info.message.length > err.message.length &&
                info.message.endsWith(err.message)
              ) {
                info.message = info.message.substring(
                  0,
                  info.message.length - err.message.length
                );
              }
            } else if (splatArgs.length > 0) {
              info.message +=
                " " +
                splatArgs
                  .map((it: unknown) => {
                    if (typeof it === "object" && it != null) {
                      return inspect(it, false, 4, true);
                    }
                    return it;
                  })
                  .join(" ");
            }
          }

          // info.messageがオブジェクトである場合、inspectで文字列化する
          if (typeof info.message === "object") {
            info.message = inspect(info.message, false, 4, true);
          }

          return `[${DateTime.local().toFormat("yyyy-MM-dd TT").trim()}] [${
            info.level
          }] [${info.label}]: ${info.message}${
            info.stack ? `\n${info.stack}` : ""
          }`;
        })
      ),
      level: "debug",
      transports: [new transports.Console()],
    });
  }
}
