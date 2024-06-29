import ky from "ky";
import { getMappings } from "./getMappings";
import mongoose from "mongoose";
import connect from "./db/db";
import Anime from "./db/schema/mappingSchema";
import fs from "fs/promises";
import chalk from "chalk";

const LAST_ID_FILE = "lastId.txt";

const getLastCrawledId = async () => {
  try {
    const lastId = await fs.readFile(LAST_ID_FILE, "utf8");
    return lastId.trim();
  } catch (error) {
    console.log("No last crawled ID found, starting from the beginning.");
    return null;
  }
};

const saveLastCrawledId = async (id: string) => {
  try {
    await fs.writeFile(LAST_ID_FILE, id, "utf8");
    console.log(chalk.greenBright(`Saved last crawled ID: ${id}`));
  } catch (error) {
    console.error("Error saving last crawled ID:", error);
  }
};

export const startCrawl = async () => {
  await connect();

  const existingMappings = await Anime.find({});
  const existingIds = new Set(existingMappings.map((mapping) => mapping.id));

  const lastCrawledId = await getLastCrawledId();
  let resumeCrawling = !lastCrawledId;

  const res = await ky.get(
    "https://raw.githubusercontent.com/5H4D0WILA/IDFetch/main/ids.txt"
  );
  const data = await res.text();

  const IDs = data.split("\n").filter((id) => id.trim() !== "");

  for (const id of IDs) {
    if (resumeCrawling || id === lastCrawledId) {
      resumeCrawling = true;

      if (existingIds.has(id)) {
        console.log(
          chalk.cyan(`ID ${id} already exists in the database. Skipping.`)
        );
        continue;
      }

      try {
        const mappings = await getMappings(id);

        if (!mappings) {
          console.log(chalk.red(`No mappings found for ID ${id}`));
          continue;
        }

        const anime = new Anime({
          ...mappings,
        });

        await anime.save();

        console.log(chalk.green(`Saved mappings for ID ${id}`));

        // Save last crawled ID
        await saveLastCrawledId(id);
      } catch (error) {
        console.error(`Error fetching/saving mappings for ID ${id}:`, error);
      }
    }
  }

  mongoose.connection.close();
};

const deleteMapping = async (id: string) => {
  await connect();
  await Anime.deleteOne({ id: id });
  mongoose.connection.close();
};

const getMapping = async () => {
  await connect();
  const mappings = await Anime.find({});

  console.log(mappings[0]);
};

const clearDb = async () => {
  await connect();
  const totalAnimes = Anime.countDocuments({});
  await Anime.deleteMany({});

  console.log("Deleted", totalAnimes);

  mongoose.connection.close();
};

await clearDb();
//await getMapping();
// await startCrawl();
