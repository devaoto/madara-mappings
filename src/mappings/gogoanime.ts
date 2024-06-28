import { findBestMatch } from "string-similarity";
import { ANIME } from "@consumet/extensions";
import chalk from "chalk";

const gogo = new ANIME.Gogoanime();

export const getGogoAnime = async (title: string) => {
  try {
    const res = await gogo.search(title);
    const results = res.results;

    if (results.length === 0) {
      return undefined;
    }

    const titles = results.map((r) => r.title);

    const bestMatch = findBestMatch(title, titles as string[]);

    return results.find((r) => r.title === bestMatch.bestMatch.target);
  } catch (e) {
    console.log(chalk.red("Gogoanime mapping not found for title: ", title));
    return null;
  }
};
