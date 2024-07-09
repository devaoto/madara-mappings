import ky from "ky";
import { getLTMMappings } from "../getMappings";
import { TrendingMedia } from "../db/schema/trendingSchema";

const getAnilistTrending = async (page: number, limit: number) => {
  const query = `query Query($page: Int, $perPage: Int, $sort: [MediaSort], $type: MediaType) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(sort: $sort, type: $type) {
        bannerImage
        averageScore
        coverImage {
          extraLarge
          large
          medium
          color
        }
        countryOfOrigin
        description
        duration
        endDate {
          year
          month
          day
        }
        episodes
        format
        genres
        favourites
        id
        idMal
        meanScore
        season
        seasonYear
        status
        studios {
          edges {
            id
            isMain
            node {
              id
              isAnimationStudio
              favourites
              name
              siteUrl
            }
          }
        }
        synonyms
        title {
          romaji
          english
          native
          userPreferred
        }
        trailer {
          id
          site
          thumbnail
        }
        type
        nextAiringEpisode {
          id
          airingAt
          timeUntilAiring
          episode
          mediaId
        }
      }
    }
  }`;

  const response = await ky.post("https://graphql.anilist.co", {
    json: {
      query,
      variables: {
        page,
        perPage: limit,
        sort: ["TRENDING_DESC", "POPULARITY_DESC"],
        type: "ANIME",
      },
    },
  });

  const data = await response.json<any>();
  return {
    media: data.data.Page.media,
    pageInfo: data.data.Page.pageInfo,
  };
};

const updateDatabase = async (mediaList: any) => {
  const bulkOps = await Promise.all(
    mediaList.map(async (media: any) => {
      console.log("Getting maps for", media.id);
      let trailer = {};
      if (
        media.trailer &&
        typeof media.trailer === "object" &&
        !Array.isArray(media.trailer) &&
        media.trailer.id
      ) {
        trailer = media.trailer;
      } else {
        trailer = {};
      }

      console.log(trailer);

      let mappings = (
        await getLTMMappings(
          String(media.id),
          media.idMal,
          media.format,
          media.seasonYear
        )
      ).mappings;

      return {
        updateOne: {
          filter: { id: media.id },
          update: {
            $set: {
              bannerImage: media.bannerImage || "",
              averageScore: media.averageScore || 0,
              coverImage: media.coverImage || {},
              countryOfOrigin: media.countryOfOrigin || "",
              description: media.description || "",
              duration: media.duration || 0,
              endDate: media.endDate || {},
              episodes: media.episodes || 0,
              format: media.format || "",
              genres: media.genres || [],
              favourites: media.favourites || 0,
              id: media.id || 0,
              idMal: media.idMal || 0,
              meanScore: media.meanScore || 0,
              season: media.season || "",
              seasonYear: media.seasonYear || 0,
              status: media.status || "",
              studios: media.studios || {},
              synonyms: media.synonyms || [],
              title: media.title || {},
              trailer: trailer,
              type: media.type || "",
              nextAiringEpisode: media.nextAiringEpisode || {},
              mappings: mappings || {},
            },
          },
          upsert: true,
        },
      };
    })
  );

  await TrendingMedia.bulkWrite(bulkOps);
};

export const getTrending = async (page: number = 1, limit: number = 50) => {
  const totalRecords = await TrendingMedia.countDocuments({
    genres: { $ne: [] },
  });
  const totalPages = Math.ceil(totalRecords / limit);

  if (page <= totalPages) {
    const trending = await TrendingMedia.find({ genres: { $ne: [] } })
      .limit(limit)
      .skip((page - 1) * limit);

    return {
      media: trending,
      pageInfo: {
        totalResults: totalRecords,
        totalPages: totalPages,
        hasNextPage: page < totalPages,
        currentPage: page,
        perPage: limit,
      },
    };
  }

  const { media: trendingMedia, pageInfo } = await getAnilistTrending(
    page,
    limit
  );
  if (trendingMedia && trendingMedia.length > 0) {
    await updateDatabase(trendingMedia);
  } else {
    console.log("No trending media found.");
  }

  const trending = await TrendingMedia.find({ genres: { $ne: [] } })
    .limit(limit)
    .skip((page - 1) * limit);

  return {
    media: trending,
    pageInfo: {
      totalResults: pageInfo.total,
      totalPages: pageInfo.lastPage,
      hasNextPage: pageInfo.hasNextPage,
      currentPage: pageInfo.currentPage,
      perPage: pageInfo.perPage,
    },
  };
};
