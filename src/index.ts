import { Hono, type Context } from "hono";
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
import { rateLimiter } from "hono-rate-limiter";
import { isValidAPIKey } from "./apiKey";
import type { BlankEnv } from "hono/types";
import APIKey from "./db/schema/apiKeySchema";

await connect();

console.log(await APIKey.find({}));

const apiKeyMiddleware = async (c: Context<BlankEnv, never, {}>, next: any) => {
  const apiKey = c.req.query("api_key") ?? c.req.header("x-api-key");

  if (apiKey && (await isValidAPIKey(apiKey, process.env.SECRET_KEY!))) {
    // @ts-ignore
    c.set("apiKey", apiKey);
  } else {
    // @ts-ignore
    c.set("apiKey", null);
  }
  await next();
};

const keyGenerator = (c: any) => {
  const apiKey = c.get("apiKey");
  return apiKey ? `api-key:${apiKey}` : `ip:${c.req.header("x-forwarded-for")}`;
};

const limiterWithApiKey = rateLimiter({
  windowMs: 60 * 1000,
  limit: 1000,
  keyGenerator,
});

const limiterWithoutApiKey = rateLimiter({
  windowMs: 60 * 1000,
  limit: 50,
  keyGenerator,
});

const app = new Hono();

app.use(apiKeyMiddleware);

app.use((c, next) => {
  // @ts-ignore
  const apiKey = c.get("apiKey");
  if (apiKey) {
    return limiterWithApiKey(c, next);
  } else {
    return limiterWithoutApiKey(c, next);
  }
});

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

app.get("/malSync/:id", async (c) => {
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

    return c.json(m.mappings?.malSync);
  }

  return c.json(mappings.mappings?.malSync);
});

app.get("/anify/:id", async (c) => {
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

    return c.json(m.mappings?.anify);
  }

  return c.json(mappings.mappings?.anify);
});

app.get("/anime/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const requestedMappings = c.req.query("mappings")?.split(",") || [];
    let mappings = await Anime.findOne({ id: id });
    console.log(requestedMappings);

    if (!mappings) {
      console.log(chalk.yellow(`Anime mapping not found for ID: ${id}`));
      console.log(chalk.cyan("Saving new mapping for: ", id));
      const m = new Anime({
        ...(await getMappings(id)),
      });

      await m.save();

      console.log(chalk.greenBright("Saved mapping for:", id));
      mappings = m;
    }

    const response = {
      // @ts-ignore
      ...mappings._doc,
      mappings: {},
    };

    if (requestedMappings.length > 0) {
      requestedMappings.forEach((mapping) => {
        if (mappings.mappings?.[mapping as keyof typeof mappings.mappings]) {
          response.mappings[mapping] =
            mappings.mappings[mapping as keyof typeof mappings.mappings];
        }
      });
    } else {
      response.mappings = mappings.mappings;
    }

    return c.json(response);
  } catch (error) {
    console.log(error);
    return c.json({ error: "An error occurred" }, 500);
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
    const animes = await Anime.find({ status: { $ne: "FINISHED" } });
    for (const anime of animes) {
      const id = anime.id;
      const newMappings = await getMappings(id);
      await Anime.updateOne({ id: id }, newMappings ?? {});
      console.log(chalk.green(`Updated mappings for anime ID: ${id}`));
    }

    const updateTrendingAndPopular = async (
      model: any,
      getMappingsFunc: any,
      logPrefix: string
    ) => {
      await model.deleteMany({});
      console.log(chalk.red(`Deleted all ${logPrefix} entries`));

      const { media } = await getMappingsFunc(1, 50);
      if (media && media.length > 0) {
        const bulkOps = media.map((item: any) => ({
          insertOne: { document: item },
        }));
        await model.bulkWrite(bulkOps);
        console.log(
          chalk.green(`Added ${media.length} new ${logPrefix} entries`)
        );
      } else {
        console.log(chalk.yellow(`No new ${logPrefix} entries found`));
      }
    };

    await Promise.all([
      updateTrendingAndPopular(TrendingMedia, getTrending, "trending anime"),
      updateTrendingAndPopular(PopularMedia, getPopular, "popular anime"),
    ]);
  } catch (error) {
    console.error(chalk.red("Error running cron job:", error));
  }
});

export default {
  port: 3000,
  fetch: app.fetch,
};
