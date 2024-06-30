import mongoose, { Document, Schema } from "mongoose";

interface IImage {
  extraLarge?: string;
  large?: string;
  medium?: string;
  color?: string;
}

interface ITitle {
  romaji?: string;
  english?: string;
  native?: string;
  userPreferred?: string;
}

interface IDate {
  year?: number;
  month?: number;
  day?: number;
}

interface IEpisodeTitle {
  ja?: string;
  en?: string;
  "x-jat"?: string;
}

interface IEpisode {
  tvdbShowId?: number;
  tvdbId?: number;
  seasonNumber?: number;
  episodeNumber?: number;
  absoluteEpisodeNumber?: number;
  title?: IEpisodeTitle;
  airDate?: string;
  airDateUtc?: string;
  runtime?: number;
  overview?: string;
  image?: string;
  episode?: string;
  anidbEid?: number;
  length?: number;
  airdate?: string;
  rating?: string;
  summary?: string;
}

interface Studios {
  edges: Edge[];
}

interface Edge {
  isMain: boolean;
  id: number;
  node: Node;
}

interface Node {
  favourites: number;
  id: number;
  isAnimationStudio: boolean;
  isFavourite: boolean;
  name: string;
  siteUrl: string;
}

interface IAnizip {
  titles?: Record<string, string>;
  episodes?: Record<string, IEpisode>;
  episodeCount?: number;
  specialCount?: number;
  images?: { coverType: string; url: string }[];
  mappings?: Record<string, any>;
}

interface IMappings {
  anilistId?: string;
  anizip?: IAnizip;
  fribb?: Record<string, any>;
  gogoanime?: Record<string, any>;
  kitsu?: Record<string, any>;
  malSync?: Record<string, any>;
  thetvdb?: Record<string, any>;
  tmdb?: Record<string, any>;
  zoro?: Record<string, any>;
}

interface Trailer {
  id: string;
  site: string;
  thumbnail: string;
}

interface IAnime extends Document {
  bannerImage?: string;
  averageScore?: number;
  coverImage?: IImage;
  title?: ITitle;
  format?: string;
  type?: string;
  description?: string;
  countryOfOrigin?: string;
  duration?: number;
  episodes?: number;
  genres?: string[];
  status?: string;
  startDate?: IDate;
  endDate?: IDate;
  synonyms?: string[];
  isAdult?: boolean;
  studios: Studios;
  season?: string;
  seasonYear?: number;
  id?: number;
  idMal?: number;
  color?: string;
  mappings?: IMappings;
}

const TrailerSchema: Schema = new Schema(
  {
    id: { type: String, required: true },
    site: { type: String, required: true },
    thumbnail: { type: String, required: true },
  },
  { _id: false }
);

const NodeSchema: Schema = new Schema(
  {
    favourites: { type: Number, required: true },
    id: { type: Number, required: true },
    isAnimationStudio: { type: Boolean, required: true },
    isFavourite: { type: Boolean, required: true },
    name: { type: String, required: true },
    siteUrl: { type: String, required: true },
  },
  { _id: false }
);

const EdgeSchema: Schema = new Schema(
  {
    isMain: { type: Boolean, required: true },
    id: { type: Number, required: true },
    node: { type: NodeSchema, required: true },
  },
  { _id: false }
);

const StudiosSchema: Schema = new Schema(
  {
    edges: { type: [EdgeSchema], required: true },
  },
  { _id: false }
);

const ImageSchema: Schema = new Schema(
  {
    extraLarge: { type: String, default: "" },
    large: { type: String, default: "" },
    medium: { type: String, default: "" },
    color: { type: String, default: "" },
  },
  { _id: false }
);

const TitleSchema: Schema = new Schema(
  {
    romaji: { type: String, default: "" },
    english: { type: String, default: "" },
    native: { type: String, default: "" },
    userPreferred: { type: String, default: "" },
  },
  { _id: false }
);

const EpisodeTitleSchema: Schema = new Schema(
  {
    ja: { type: String, default: "" },
    en: { type: String, default: "" },
    "x-jat": { type: String, default: "" },
  },
  { _id: false }
);

const EpisodeSchema: Schema = new Schema(
  {
    tvdbShowId: { type: Number, default: null },
    tvdbId: { type: Number, default: null },
    seasonNumber: { type: Number, default: null },
    episodeNumber: { type: Number, default: null },
    absoluteEpisodeNumber: { type: Number, default: null },
    title: { type: EpisodeTitleSchema, default: {} },
    airDate: { type: String, default: "" },
    airDateUtc: { type: String, default: "" },
    runtime: { type: Number, default: null },
    overview: { type: String, default: "" },
    image: { type: String, default: "" },
    episode: { type: String, default: "" },
    anidbEid: { type: Number, default: null },
    length: { type: Number, default: null },
    airdate: { type: String, default: "" },
    rating: { type: String, default: "" },
    summary: { type: String, default: "" },
  },
  { _id: false }
);

const StartDateSchema: Schema = new Schema({
  year: { type: Number, default: null },
  month: { type: Number, default: null },
  day: { type: Number, default: null },
});

const EndDateSchema: Schema = new Schema({
  year: { type: Number, default: null },
  month: { type: Number, default: null },
  day: { type: Number, default: null },
});

const AnizipSchema: Schema = new Schema(
  {
    titles: { type: Map, of: String, default: {} },
    episodes: { type: Map, of: EpisodeSchema, default: {} },
    episodeCount: { type: Number, default: null },
    specialCount: { type: Number, default: null },
    images: {
      type: [{ coverType: { type: String }, url: { type: String } }],
      default: [],
    },
    mappings: { type: Map, of: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const MappingsSchema: Schema = new Schema(
  {
    anilistId: { type: String, default: "" },
    anizip: { type: AnizipSchema, default: {} },
    fribb: { type: Schema.Types.Mixed, default: {} },
    gogoanime: { type: Map, of: Schema.Types.Mixed, default: {} },
    kitsu: { type: Map, of: Schema.Types.Mixed, default: {} },
    malSync: { type: Map, of: Schema.Types.Mixed, default: {} },
    thetvdb: { type: Map, of: Schema.Types.Mixed, default: {} },
    tmdb: { type: Map, of: Schema.Types.Mixed, default: {} },
    zoro: { type: Map, of: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const AnimeSchema: Schema = new Schema({
  bannerImage: { type: String, default: "" },
  averageScore: { type: Number, default: null },
  coverImage: { type: ImageSchema, default: {} },
  title: { type: TitleSchema, default: {} },
  format: { type: String, default: "" },
  type: { type: String, default: "" },
  season: { type: String, default: "" },
  seasonYear: { type: Number, default: null },
  id: { type: Number, default: null },
  idMal: { type: Number, default: null },
  color: { type: String, default: "" },
  status: { type: String, default: "" },
  episodes: { type: Number, default: null },
  duration: { type: Number, default: null },
  description: { type: String, default: "" },
  studios: { type: StudiosSchema, default: {} },
  trailer: { type: TrailerSchema, default: [] },
  startDate: { type: StartDateSchema, default: {} },
  endDate: { type: EndDateSchema, default: {} },
  synonyms: { type: [String], default: [] },
  countryOfOrigin: { type: String, default: "" },
  isAdult: { type: Boolean, default: false },
  mappings: { type: MappingsSchema, default: {} },
});

const Anime = mongoose.model<IAnime>("Anime", AnimeSchema);

export default Anime;
