import chalk from "chalk";
import ky from "ky";

export interface Titles {
  "x-jat": string;
  ja: string;
  en: string;
}

export interface EpisodeTitle {
  ja: string;
  en: string;
  "x-jat": string;
}

export interface Episode {
  tvdbShowId: number;
  tvdbId: number;
  seasonNumber: number;
  episodeNumber: number;
  absoluteEpisodeNumber: number;
  title: EpisodeTitle;
  airDate: string;
  airDateUtc: string;
  runtime: number;
  overview: string;
  image: string;
  episode: string;
  anidbEid: number;
  length: number;
  airdate: string;
  rating: string;
  summary: string;
}

export interface Episodes {
  [key: string]: Episode;
}

export interface Image {
  coverType: string;
  url: string;
}

export interface Mappings {
  animeplanet_id: string;
  kitsu_id: number;
  mal_id: number;
  type: string;
  anilist_id: number;
  anisearch_id: number;
  anidb_id: number;
  notifymoe_id: string;
  livechart_id: number;
  thetvdb_id: number;
  imdb_id: string;
  themoviedb_id: string;
}

export interface AniZipInfo {
  titles: Titles;
  episodes: Episodes;
  episodeCount: number;
  specialCount: number;
  images: Image[];
  mappings: Mappings;
}

export const getAniZip = async (id: string) => {
  try {
    const res = await ky.get(`https://api.ani.zip/mappings?anilist_id=${id}`);
    const data = await res.json<AniZipInfo>();

    return data;
  } catch (error) {
    console.log(chalk.red("AniZip mapping not found for ID: ", id));
    return null;
  }
};
