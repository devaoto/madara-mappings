import { request } from "./request";

export interface QueryResponse {
  Media: Media;
}

export interface Media {
  averageScore: number | null;
  bannerImage: string | null;
  characters: CharacterConnection | null;
  countryOfOrigin: string | null;
  coverImage: Image | null;
  duration: number | null;
  description: string | null;
  endDate: Date | null;
  episodes: number | null;
  favourites: number | null;
  format: string | null;
  genres: string[] | null;
  hashtag: string | null;
  id: number;
  idMal: number | null;
  isAdult: boolean;
  meanScore: number | null;
  nextAiringEpisode: AiringEpisode | null;
  popularity: number | null;
  season: string | null;
  seasonYear: number | null;
  recommendations: RecommendationConnection | null;
  relations: MediaRelationConnection | null;
  siteUrl: string | null;
  startDate: Date | null;
  status: string | null;
  streamingEpisodes: StreamingEpisode[] | null;
  studios: StudioConnection | null;
  tags: Tag[] | null;
  synonyms: string[] | null;
  title: MediaTitle;
  trailer: Trailer | null;
  trending: number | null;
  type: string | null;
  updatedAt: number | null;
}

export interface CharacterConnection {
  edges: CharacterEdge[];
}

export interface CharacterEdge {
  name: string;
  id: number;
  role: string;
  node: Character;
  voiceActors: VoiceActor[];
}

export interface Character {
  id: number;
  image: Image;
  gender: string | null;
  bloodType: string | null;
  age: string | null;
  favourites: number | null;
  description: string | null;
  dateOfBirth: Date | null;
  name: CharacterName;
}

export interface CharacterName {
  first: string | null;
  middle: string | null;
  last: string | null;
  full: string;
  native: string | null;
  alternative: string[] | null;
  alternativeSpoiler: string[] | null;
  userPreferred: string;
}

export interface VoiceActor {
  age: number | null;
  bloodType: string | null;
  favourites: number | null;
  description: string | null;
  gender: string | null;
  id: number;
  image: Image;
  languageV2: string;
  name: CharacterName;
  yearsActive: number[] | null;
  homeTown: string | null;
}

export interface Image {
  extraLarge?: string | null;
  color?: string | null;
  large: string | null;
  medium: string | null;
}

export interface Date {
  year: number | null;
  month: number | null;
  day: number | null;
}

export interface AiringEpisode {
  id: number;
  airingAt: number;
  timeUntilAiring: number;
  episode: number;
  mediaId: number;
}

export interface RecommendationConnection {
  edges: RecommendationEdge[];
}

export interface RecommendationEdge {
  node: Recommendation;
}

export interface Recommendation {
  id: number;
  userRating: number | null;
  rating: number | null;
  mediaRecommendation: Media;
}

export interface MediaRelationConnection {
  edges: MediaRelationEdge[];
}

export interface MediaRelationEdge {
  characterName: string | null;
  characterRole: string | null;
  dubGroup: string | null;
  id: number;
  isMainStudio: boolean | null;
  relationType: string;
  roleNotes: string | null;
  staffRole: string | null;
  node: Media;
  characters: Character[];
}

export interface StreamingEpisode {
  title: string;
  thumbnail: string;
  url: string;
  site: string;
}

export interface StudioConnection {
  edges: StudioEdge[];
}

export interface StudioEdge {
  isMain: boolean | null;
  id: number;
  node: Studio;
}

export interface Studio {
  id: number;
  favourites: number | null;
  isAnimationStudio: boolean | null;
  name: string;
}

export interface Tag {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  rank: number | null;
  isGeneralSpoiler: boolean | null;
  isMediaSpoiler: boolean | null;
  isAdult: boolean | null;
  userId: number | null;
}

export interface MediaTitle {
  romaji: string | null;
  english: string | null;
  native: string | null;
  userPreferred: string;
}

export interface Trailer {
  id: string | null;
  site: string | null;
  thumbnail: string | null;
}

export const search = async (query: string) => {
  const response = await request(
    process.env.CORS_PROXY
      ? [
          "https://graphql.anilist.co",
          `${process.env.CORS_PROXY}/https://graphql.anilist.co`,
        ][Math.floor(Math.random() * 2)]
      : "https://graphql.anilist.co",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `
                query Query($page: Int, $perPage: Int, $search: String) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      perPage
      currentPage
      lastPage
      hasNextPage
    }
    media(search: $search) {
      bannerImage
      averageScore
      coverImage {
        extraLarge
        large
        medium
        color
      }
      title {
        romaji
        english
        native
        userPreferred
      }
      format
      type
      season
      seasonYear
      id
      idMal
    }
  }
}
            `,
        variables: {
          query,
          page: 1,
          perPage: 10,
        },
      }),
    }
  );
  const data = response?.json();

  return (
    (await data) as {
      data: {
        Page: {
          media: {
            bannerImage: string;
            averageScore: number;
            coverImage: {
              extraLarge: string;
              large: string;
              medium: string;
              color: string;
            };
            title: {
              romaji: string;
              english: string;
              native: string;
              userPreferred: string;
            };
            id: number;
            idMal: number;
            format: string;
            type: string;
            season: string;
            seasonYear: string;
          }[];
        };
      };
    }
  ).data.Page.media;
};

export const getTitle = async (id: number) => {
  const response = await request(`https://graphql.anilist.co`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `
        query Query($id: Int) {
          Media(id: $id) {
      bannerImage
      averageScore
      coverImage {
        extraLarge
        large
        medium
        color
      }
      title {
        romaji
        english
        native
        userPreferred
      }
      format
      type
      season
      seasonYear
      id
      idMal
            countryOfOrigin
            description
            duration
            episodes
            endDate {
              year
              month
              day
            }
            genres
            isAdult
            startDate {
              year
              month
              day
            }
            synonyms
            trailer {
              id
              site
              thumbnail
            }
            status
            studios {
              edges {
                isMain
                id
                node {
                  favourites
                  id
                  isAnimationStudio
                  isFavourite
                  name
                  siteUrl
                }
              }
            }
          }
        }
      `,
      variables: {
        id,
      },
    }),
  });

  const data = (await response?.json()) as { data: QueryResponse };

  return {
    ...data.data.Media,
    color: data.data.Media.coverImage?.color || null,
  };
};
