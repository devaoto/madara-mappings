import { findBestMatch } from "string-similarity";

export const getKitsu = async (title: string) => {
  try {
    const response = await fetch(
      `https://kitsu.io/api/edge/anime?filter[text]=${title}`
    );
    const kData = await response.json();

    const bestMatch = findBestMatch(
      String(title),
      kData.data.map(
        (d: { attributes: { titles: { en_jp: string; en: string } } }) =>
          d.attributes.titles.en_jp ?? d.attributes.titles.en ?? ""
      )
    );

    return kData.data[bestMatch.bestMatchIndex];
  } catch (error) {
    if (error instanceof Error) {
      console.log(
        `[-] Failed to get mappings for ${title} on Kitsu: ${error.name} - ${error.message}`
      );
    }
    console.log(`[-] Failed to get mappings for ${title} on Kitsu`);
    return null;
  }
};
