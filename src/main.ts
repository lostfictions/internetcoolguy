import fs from "fs";
import path from "path";
import { twoot } from "twoot";
import {
  BSKY_PASSWORD,
  BSKY_USERNAME,
  DATA_DIR,
  MASTODON_SERVER,
  MASTODON_TOKEN,
} from "./env";

type Data = { [word: string]: { [action: string]: number } };

// we use two files to keep track of what we've used:

// when a [thing, action] pair is used, this just removes the action
const remainingAll = path.join(DATA_DIR, "remaining-all.json");

// when a [thing, action] pair is used, this removes the whole thing. this
// ensures less repetition, but we'll run out of material quicker.
const remainingActions = path.join(DATA_DIR, "remaining-actions.json");

let shouldReinitialize =
  !fs.existsSync(remainingAll) || !fs.existsSync(remainingActions);

let all: Data;
let actions: Data;

if (!shouldReinitialize) {
  all = JSON.parse(fs.readFileSync(remainingAll, "utf8"));
  actions = JSON.parse(fs.readFileSync(remainingActions, "utf8"));
  if (Object.keys(actions!).length === 0 || Object.keys(all!).length === 0) {
    shouldReinitialize = true;
  }
}

if (shouldReinitialize) {
  const data = fs.readFileSync(path.join(DATA_DIR, "data.json"), "utf8");
  all = JSON.parse(data);
  actions = JSON.parse(data);
  fs.writeFileSync(remainingAll, data);
  fs.writeFileSync(remainingActions, data);
  console.log("initialized new files to pull from.");
}

function choose<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function* getToot() {
  const thing = choose(Object.keys(actions));
  const action = choose(
    Object.entries(actions[thing])
      .filter((e) => e[1] === Math.min(...Object.values(actions[thing])))
      .map((e) => e[0]),
  );

  yield Math.random() > 0.5
    ? `the ${thing} ${action} has logged on`
    : `the ${thing} ${action} has entered the chat`;

  // once we know we've posted successfully, we can write out the update files.
  delete actions[thing];
  delete all[thing][action];
  if (Object.keys(all[thing]).length === 0) delete all[thing];
  fs.writeFileSync(remainingAll, JSON.stringify(all, null, 2));
  fs.writeFileSync(remainingActions, JSON.stringify(actions, null, 2));
}

async function doToot(): Promise<void> {
  const gen = getToot();

  const status = gen.next().value as string;

  const results = await twoot({ status }, [
    {
      type: "mastodon",
      server: MASTODON_SERVER,
      token: MASTODON_TOKEN,
    },
    {
      type: "bsky",
      username: BSKY_USERNAME,
      password: BSKY_PASSWORD,
    },
  ]);

  for (const res of results) {
    if (res.type === "error") {
      console.error(`error while twooting:\n${res.message}\n`);
    } else if (res.type === "bsky") {
      console.log(`skeeted at '${res.status.uri}'!`);
    } else {
      console.log(`tooted at '${res.status.url}'!`);
    }
  }

  gen.next();
}

const argv = process.argv.slice(2);

if (argv.includes("local")) {
  console.log("Running locally!");
  setInterval(() => {
    const gen = getToot();
    const toot = gen.next().value as string;
    console.log(`${toot}`);
    gen.next();
  }, 1000);
} else {
  void doToot().then(() => process.exit(0));
}
