import {
  getTitle,
  getTMDB,
  getZoro,
  getMalSync,
  getGogoAnime,
  getFribbList,
  getKitsu,
} from "./mappings";
import { getAniZip } from "./mappings/anizip";
import { getTVDB } from "./mappings/thetvdb";

export const getMappings = async (id: string) => {
  const anilistInfo = await getTitle(Number(id));

  if (!anilistInfo) {
    return null;
  }

  const malId = anilistInfo.idMal;
  const titleOptions = [
    anilistInfo.title.english,
    anilistInfo.title.romaji,
    anilistInfo.title.native,
  ].filter(Boolean);
  const primaryTitle = titleOptions[0];

  const fribbList = await getFribbList(malId!);

  const [malSync, gogoanime, zoro, kitsu, thetvdb, tmdb, anizip] =
    await Promise.all([
      getMalSync(anilistInfo.id!),
      getGogoAnime(primaryTitle!),
      getZoro(primaryTitle!),
      getKitsu(primaryTitle!),
      getTVDB(
        String(fribbList?.thetvdb_id),
        String(anilistInfo.seasonYear),
        anilistInfo.format!
      ),
      getTMDB(fribbList?.thetvdb_id, anilistInfo.format!),
      getAniZip(id),
    ]);

  return {
    ...anilistInfo,
    mappings: {
      anilistId: id,
      anizip: anizip || {},
      fribb: fribbList ?? {},
      gogoanime: gogoanime || {},
      kitsu: kitsu || {},
      malSync: malSync || {},
      thetvdb: thetvdb || {},
      tmdb: tmdb || {},
      zoro: zoro || {},
    },
  };
};
