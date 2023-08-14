import fs from "fs";
import path from "path";
import { twoot } from "twoot";
import { DATA_DIR, MASTODON_SERVER, MASTODON_TOKEN } from "./env";

// we use two files to keep track of what we've used:

// when a [thing, action] pair is used, this just removes the action
const remainingAll = path.join(DATA_DIR, "remaining-all.json");

// when a [thing, action] pair is used, this removes the whole thing. this
// ensures less repetition, but we'll run out of material quicker.
const remainingActions = path.join(DATA_DIR, "remaining-actions.json");

if (!fs.existsSync(remainingAll) || !fs.existsSync(remainingActions)) {
  const data = fs.readFileSync(path.join(DATA_DIR, "data.json"), "utf8");
  fs.writeFileSync(remainingAll, data);
  fs.writeFileSync(remainingActions, data);
  console.log("initialized new files to pull from.");
}

type Data = { [word: string]: { [action: string]: number } };

function choose<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function* getToot() {
  const all: Data = JSON.parse(fs.readFileSync(remainingAll, "utf8"));
  const actions: Data = JSON.parse(fs.readFileSync(remainingActions, "utf8"));

  const thing = choose(Object.keys(actions));
  const action = choose(
    Object.entries(actions[thing])
      .filter((e) => e[1] === Math.min(...Object.values(actions[thing])))
      .map((e) => e[0]),
  );

  yield `the ${thing} ${action} has logged on`;

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
  ]);

  for (const res of results) {
    if (res.type === "error") {
      console.error(`error while twooting:\n${res.message}\n`);
    } else if (res.type === "twitter") {
      console.log(
        `tweeted at 'https://twitter.com/${res.status.user.name}/${res.status.id}'!`,
      );
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
