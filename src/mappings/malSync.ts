import { z } from "zod";
import ky from "ky";
import chalk from "chalk";

const url = `https://api.malsync.moe/mal/anime/anilist:`;

export interface SiteDetail {
  identifier: string | number;
  image: string;
  malId: number;
  aniId: number;
  page: string;
  title: string;
  type: string;
  url: string;
  external?: boolean;
}

export interface Sites {
  [key: string]: {
    [key: string]: SiteDetail;
  };
}

export interface MalSync {
  id: number;
  type: string;
  title: string;
  url: string;
  total: number | null;
  image: string;
  malId: number;
  Sites: Sites;
}

export interface ParsedMalSync {
  "9anime": string | null;
  gogoanime: string | null;
  "gogoanime-dub": string | null;
  zoro: string | null;
  crunchyroll: string | null;
  hulu: string | null;
  netflix: string | null;
}

export const getMalSync = async (id: number) => {
  try {
    const idSchema = z.number();

    if (!idSchema.safeParse(id).success) {
      throw new TypeError("id must be a number");
    }

    const res = await ky.get(url + id);
    const data = await res.json<MalSync>();

    return data;
  } catch (error) {
    console.log(chalk.red("MalSync mapping not found for ID: ", id));
    return null;
  }
};
