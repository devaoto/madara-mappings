import chalk from "chalk";
import { load, type Cheerio, type CheerioAPI, type Element } from "cheerio";
import { findBestMatch } from "string-similarity";

export interface TVDBDate {
  day: number;
  month: string;
  year: number;
  monthNum: number;
}

function dateStringToObject(dateString: string): TVDBDate | null {
  if (!dateString || dateString === null) {
    return null;
  }
  const parts = dateString.split(" ");
  const month = parts[0];
  const day = parseInt(parts[1].replace(",", ""));
  const year = parseInt(parts[2]);
  const monthNum = new Date(`${month} 1, 2000`).getMonth() + 1;

  return {
    day,
    month,
    year,
    monthNum,
  };
}

interface TVDBHit {
  translations: {
    por?: string;
    eng?: string;
  };
  name: string;
  type: string;
  year?: string;
  id: string;
}

interface Artworks {
  backgrounds: string[];
  banners: string[];
  clearArt: string[];
  clearLogo: string[];
  icons: string[];
  posters: string[];
}

export interface ParsedData {
  seriesId: string | null;
  status: string | null;
  firstAired: string | null;
  recent: string | null;
  airs: string | null;
  studio: string | null;
  network: string[] | null;
  averageRuntime: string | null;
  genres: string[];
  originalCountry: string | null;
  originalLanguage: string | null;
  geographicLocation: string[];
  subGenre: string[];
  supernaturalBeings: string[];
  imdbLink: string | null;
  officialWebsite: string | null;
  redditLink: string | null;
  tvMazeLink: string | null;
  theMovieDBLink: string | null;
  twitterLink: string | null;
  wikidataLink: string | null;
  wikipediaLink: string | null;
  trailerLink: string | null;
  favoritedCount: number | null;
  created: {
    date: TVDBDate | null;
    by: string | null;
  };
  modified: {
    date: TVDBDate | null;
    by: string | null;
  };
}

export const getTVDB = async (
  id: string,
  year?: string,
  format: string = "TV"
): Promise<(ParsedData & { artworks: Artworks }) | null> => {
  try {
    const artworks: Artworks = {
      backgrounds: [],
      banners: [],
      clearArt: [],
      clearLogo: [],
      icons: [],
      posters: [],
    };

    const artworkResponse = await fetch(
      `https://thetvdb.com/dereferrer/${
        format === "TV" || format === "TV_SHORT" ? "series" : "movie"
      }/${id}`
    );
    const artworkData = await artworkResponse.text();
    const $$ = load(artworkData);

    const getTextOrFallback = (
      element: Cheerio<Element> | undefined
    ): string | null => {
      return element ? element.text().trim() : null;
    };

    let parsedData: ParsedData = {
      seriesId: null,
      status: null,
      firstAired: null,
      recent: null,
      airs: null,
      studio: null,
      network: null,
      averageRuntime: null,
      genres: [],
      originalCountry: null,
      originalLanguage: null,
      geographicLocation: [],
      subGenre: [],
      supernaturalBeings: [],
      imdbLink: null,
      officialWebsite: null,
      redditLink: null,
      tvMazeLink: null,
      theMovieDBLink: null,
      twitterLink: null,
      wikidataLink: null,
      wikipediaLink: null,
      trailerLink: null,
      favoritedCount: null,
      created: {
        date: null,
        by: null,
      },
      modified: {
        date: null,
        by: null,
      },
    };

    // Extracting each piece of information
    parsedData.seriesId = getTextOrFallback(
      $$('#series_basic_info li:contains("TheTVDB.com Series ID") span')
    );
    parsedData.status = getTextOrFallback(
      $$('#series_basic_info li:contains("Status") span')
    );
    parsedData.firstAired = getTextOrFallback(
      $$('#series_basic_info li:contains("First Aired") span')
    );
    parsedData.recent = getTextOrFallback(
      $$('#series_basic_info li:contains("Recent") span')
    );
    parsedData.airs =
      getTextOrFallback($$('#series_basic_info li:contains("Airs") span'))
        ?.replace(/\s+/g, " ")
        .trim() || null;
    parsedData.studio =
      getTextOrFallback($$('#series_basic_info li:contains("Studio") span'))
        ?.replace(/\s+/g, " ")
        .trim() || null;
    parsedData.network =
      $$('#series_basic_info li:contains("Network") span')
        .text()
        .trim()
        .split("\n")
        .map((m) => m.replace(/\s+/g, " ").trim())
        .filter((f) => f !== " " && f !== "") || null;
    parsedData.averageRuntime = getTextOrFallback(
      $$('#series_basic_info li:contains("Average Runtime") span')
    );
    $$('#series_basic_info li:contains("Genres") span a').each(
      (index, element) => {
        parsedData.genres.push($$(element).text().trim());
      }
    );
    parsedData.originalCountry = getTextOrFallback(
      $$('#series_basic_info li:contains("Original Country") span')
    );
    parsedData.originalLanguage = getTextOrFallback(
      $$('#series_basic_info li:contains("Original Language") span')
    );
    $$('#series_basic_info li:contains("Geographic Location") span a').each(
      (index, element) => {
        parsedData.geographicLocation.push($$(element).text().trim());
      }
    );
    $$('#series_basic_info li:contains("Sub-Genre") span a').each(
      (index, element) => {
        parsedData.subGenre.push($$(element).text().trim());
      }
    );
    $$('#series_basic_info li:contains("Supernatural Beings") span a').each(
      (index, element) => {
        parsedData.supernaturalBeings.push($$(element).text().trim());
      }
    );
    parsedData.imdbLink =
      $$(
        '#series_basic_info li:contains("On Other Sites") span a[href*="imdb"]'
      ).attr("href") || null;
    parsedData.officialWebsite =
      $$(
        '#series_basic_info li:contains("On Other Sites") span a[href*="tenshitsuki"]'
      ).attr("href") || null;
    parsedData.redditLink =
      $$(
        '#series_basic_info li:contains("On Other Sites") span a[href*="reddit"]'
      ).attr("href") || null;
    parsedData.tvMazeLink =
      $$(
        '#series_basic_info li:contains("On Other Sites") span a[href*="tvmaze"]'
      ).attr("href") || null;
    parsedData.theMovieDBLink =
      $$(
        '#series_basic_info li:contains("On Other Sites") span a[href*="themoviedb"]'
      ).attr("href") || null;
    parsedData.twitterLink =
      $$(
        '#series_basic_info li:contains("On Other Sites") span a[href*="twitter"]'
      ).attr("href") || null;
    parsedData.wikidataLink =
      $$(
        '#series_basic_info li:contains("On Other Sites") span a[href*="wikidata"]'
      ).attr("href") || null;
    parsedData.wikipediaLink = getTextOrFallback(
      $$(
        '#series_basic_info li:contains("On Other Sites") span a[href*="wikipedia"]'
      )
    );
    parsedData.trailerLink =
      $$('#series_basic_info li:contains("Trailers") a[href*="youtube"]').attr(
        "href"
      ) || null;

    // Handling favorited count
    let favoritedText = getTextOrFallback(
      $$('#series_basic_info li:contains("Favorited") span')
    );
    if (favoritedText) {
      const match = favoritedText.match(/\d+/);
      parsedData.favoritedCount = match ? parseInt(match[0]) : null;
    } else {
      parsedData.favoritedCount = null;
    }

    parsedData.created.date = dateStringToObject(
      getTextOrFallback($$('#series_basic_info li:contains("Created") span'))!
    );
    parsedData.created.by = getTextOrFallback(
      $$('#series_basic_info li:contains("Created") .user-inline')
    );
    parsedData.modified.date = dateStringToObject(
      getTextOrFallback($$('#series_basic_info li:contains("Modified") span'))!
    );
    parsedData.modified.by = getTextOrFallback(
      $$('#series_basic_info li:contains("Modified") .user-inline')
    );

    // Backgrounds
    $$(
      "div.tab-content > div#artwork > div.tab-content > div#artwork-backgrounds > div.simple-grid > div"
    ).each((_, el) => {
      artworks.backgrounds.push(
        $$(el).find("a > img").attr("data-src") as string
      );
    });

    // Banners
    $$(
      "div.tab-content > div#artwork > div.tab-content > div#artwork-banners > div.simple-grid > div"
    ).each((_, el) => {
      artworks.banners.push($$(el).find("a > img").attr("data-src") as string);
    });

    // Clear Art
    $$(
      "div.tab-content > div#artwork > div.tab-content > div#artwork-clearart > div.simple-grid > div"
    ).each((_, el) => {
      artworks.clearArt.push($$(el).find("a > img").attr("data-src") as string);
    });

    // Clear Logo
    $$(
      "div.tab-content > div#artwork > div.tab-content > div#artwork-clearlogo > div.simple-grid > div"
    ).each((_, el) => {
      artworks.clearLogo.push(
        $$(el).find("a > img").attr("data-src") as string
      );
    });

    // Icons
    $$(
      "div.tab-content > div#artwork > div.tab-content > div#artwork-icons > div.simple-grid > div"
    ).each((_, el) => {
      artworks.icons.push($$(el).find("a > img").attr("data-src") as string);
    });

    // Posters
    $$(
      "div.tab-content > div#artwork > div.tab-content > div#artwork-posters > div.simple-grid > div"
    ).each((_, el) => {
      artworks.posters.push($$(el).find("a > img").attr("data-src") as string);
    });

    return {
      ...parsedData,
      artworks,
    };
  } catch (error: unknown) {
    console.log(chalk.red("TheTVDB mapping not found for ID: ", id));
    return null;
  }
};
