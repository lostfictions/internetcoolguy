import { existsSync } from "fs";
import { parseEnv, z } from "znv";
import { config } from "dotenv";
import * as Sentry from "@sentry/node";
import { CaptureConsole } from "@sentry/integrations";

config();

export const {
  NODE_ENV,
  DATA_DIR,
  MASTODON_SERVER,
  MASTODON_TOKEN,
  SENTRY_DSN,
} = parseEnv(
  // eslint-disable-next-line node/no-process-env
  process.env,
  {
    NODE_ENV: {
      schema: z.string().optional(),
    },
    DATA_DIR: {
      schema: z.string().min(1),
      defaults: { _: "persist" },
    },
    MASTODON_SERVER: {
      schema: z.string().url(),
      defaults: { _: "https://mastodon.social" },
    },
    MASTODON_TOKEN: {
      schema: z.string().min(1),
      defaults: { production: undefined, _: "unused" },
    },
    SENTRY_DSN: {
      schema: z.string().min(1),
      defaults: { production: undefined, _: "unused" },
    },
  },
);

if (!existsSync(DATA_DIR)) {
  throw new Error(`Data directory '${DATA_DIR}' doesn't exist!`);
}

if (NODE_ENV === "production") {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: NODE_ENV,
    integrations: [
      new CaptureConsole({ levels: ["warn", "error", "debug", "assert"] }),
    ],
  });
}
