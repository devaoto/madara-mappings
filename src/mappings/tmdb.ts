import chalk from "chalk";

export const getTMDB = async (tvdbId: any, format?: string) => {
  if (!format) format = "TV";

  try {
    const tmdb = await (
      await fetch(
        `https://api.themoviedb.org/3/find/${tvdbId}?api_key=5201b54eb0968700e693a30576d7d4dc&external_source=tvdb_id`
      )
    ).json();

    return format === "TV" ? tmdb.tv_results[0] : tmdb;
  } catch (error: any) {
    console.log(chalk.red("TMDB mapping not found for ID: ", tvdbId));
    return null;
  }
};
