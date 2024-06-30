import { Hono } from "hono";
import { getLTMMappings, getMappings } from "./getMappings";
import connect from "./db/db";
import Anime from "./db/schema/mappingSchema";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";
import chalk from "chalk";
import cron from "node-cron";
import { getTrending } from "./providers/trending";
import { TrendingMedia } from "./db/schema/trendingSchema";

await connect();
const app = new Hono();

app.use(prettyJSON());
app.use(cors());

app.get("/", (c) => {
  return c.json({
    message: "Hello World!",
  });
});

app.get("/anime/delete/:id", async (c) => {
  try {
  } catch (error) {}
});

app.get("/anime/:id", async (c) => {
  try {
    const id = c.req.param("id");
    let mappings = await Anime.findOne({ id: id });

    if (!mappings) {
      console.log(chalk.yellow(`Anime mapping not found for ID: ${id}`));
      console.log(chalk.cyan("Saving new mapping for: ", id));
      const m = new Anime({
        ...(await getMappings(id)),
      });

      await m.save();

      console.log(chalk.greenBright("Saved mapping for:", id));

      return c.json(m);
    }

    return c.json(mappings);
  } catch (error) {
    console.log(error);
  }
});

app.get("/trending", async (c) => {
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 50;

  return c.json(await getTrending(page, limit));
});

cron.schedule("0 */5 * * *", async () => {
  try {
    console.log(chalk.blue("Running cron job to update anime mappings..."));
    const animes = await Anime.find({ status: { $ne: "FINISHED" } });
    for (const anime of animes) {
      const id = anime.id;
      const newMappings = await getMappings(id);
      await Anime.updateOne({ id: id }, newMappings ?? {});
      console.log(chalk.green(`Updated mappings for anime ID: ${id}`));
    }
    const trending = await TrendingMedia.find({ status: { $ne: "FINISHED" } });
    for (const anime of trending) {
      const id = anime.id;
      const newMappings = await getLTMMappings(
        id,
        String(anime.idMal),
        anime.format,
        anime.seasonYear
      );
      await TrendingMedia.updateOne({ id: id }, newMappings ?? {});
      console.log(chalk.green(`Updated mappings for anime ID: ${id}`));
    }
  } catch (error) {
    console.error(chalk.red("Error running cron job:", error));
  }
});

export default {
  port: 3000,
  fetch: app.fetch,
};
