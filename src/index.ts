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
import { PopularMedia } from "./db/schema/popularSchema";
import { getPopular } from "./providers/popular";

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

app.get("/popular", async (c) => {
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 50;

  return c.json(await getPopular(page, limit));
});

cron.schedule("0 */5 * * *", async () => {
  try {
    console.log(chalk.blue("Running cron job to update anime mappings..."));

    const updateMappings = async (
      model: any,
      getMappingsFunc: any,
      logPrefix: string
    ) => {
      const items = await model.find({ status: { $ne: "FINISHED" } });
      const updatePromises = items.map(async (item: any) => {
        const id = item.id;
        const newMappings = await getMappingsFunc(
          id,
          String(item.idMal),
          item.format,
          item.seasonYear
        );
        await model.updateOne({ id: id }, newMappings ?? {});
        console.log(chalk.green(`Updated mappings for ${logPrefix} ID: ${id}`));
      });
      await Promise.all(updatePromises);
    };

    await Promise.all([
      updateMappings(Anime, getMappings, "anime"),
      updateMappings(TrendingMedia, getLTMMappings, "trending anime"),
      updateMappings(PopularMedia, getLTMMappings, "popular anime"),
    ]);
  } catch (error) {
    console.error(chalk.red("Error running cron job:", error));
  }
});
export default {
  port: 3000,
  fetch: app.fetch,
};
