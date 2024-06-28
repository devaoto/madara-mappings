import ky from "ky";
import { z } from "zod";

export interface FribbList {
  livechart_id: number;
  thetvdb_id: number;
  "anime-planet_id": string;
  imdb_id: string;
  anisearch_id: number;
  themoviedb_id: number;
  anidb_id: number;
  kitsu_id: number;
  mal_id: number;
  type: string;
  "notify.moe_id": string;
  anilist_id: number;
}

const url =
  "https://raw.githubusercontent.com/Fribb/anime-lists/master/anime-list-full.json";

export const getFribbList = async (malId: number) => {
  try {
    const malIdSchema = z.number();

    if (!malIdSchema.safeParse(malId).success) {
      throw new TypeError("malId must be a number");
    }

    const res = await ky.get(url);
    const fribbList = await res.json<FribbList[]>();

    return fribbList.find((fribb) => fribb.mal_id === malId);
  } catch (error) {
    return null;
  }
};
