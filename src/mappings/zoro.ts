import { findBestMatch } from "string-similarity";
import { ANIME } from "@consumet/extensions";
import chalk from "chalk";

const zoro = new ANIME.Zoro();

export const getZoro = async (title: string) => {
  try {
    const results = (await zoro.search(title)).results;
    if (results.length === 0) {
      return undefined;
    }

    let titles = results.map((result) => result.title);

    const bestMatch = findBestMatch(title, titles as string[]);
    return results.find((r) => r.title === bestMatch.bestMatch.target);
  } catch (error) {
    console.log(chalk.red("Zoro mapping not found for title: ", title));
    return null;
  }
};
