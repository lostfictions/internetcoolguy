import envalid from "envalid";

export const { DATA_DIR, MASTODON_SERVER, MASTODON_TOKEN } = envalid.cleanEnv(
  process.env,
  {
    DATA_DIR: envalid.str({ devDefault: "persist" }),
    MASTODON_SERVER: envalid.url({ default: "https://mastodon.social/" }),
    MASTODON_TOKEN: envalid.str()
  },
  { strict: true }
);
