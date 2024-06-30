import mongoose, { Schema, Document } from "mongoose";

interface CoverImage extends Document {
  extraLarge: string;
  large: string;
  medium: string;
  color: string;
}

interface EndDate extends Document {
  year: number;
  month: number;
  day: number;
}

interface StudioNode extends Document {
  id: number;
  isAnimationStudio: boolean;
  favourites: number;
  name: string;
  siteUrl: string;
}

interface StudioEdge extends Document {
  id: number;
  isMain: boolean;
  node: StudioNode;
}

interface Studios extends Document {
  edges: StudioEdge[];
}

interface Title extends Document {
  romaji: string;
  english: string;
  native: string;
  userPreferred: string;
}

interface Trailer extends Document {
  id: string;
  site: string;
  thumbnail: string;
}

interface NextAiringEpisode extends Document {
  id: number;
  airingAt: number;
  timeUntilAiring: number;
  episode: number;
  mediaId: number;
}

interface Media extends Document {
  bannerImage: string;
  averageScore: number;
  coverImage: CoverImage;
  countryOfOrigin: string;
  description: string;
  duration: number;
  endDate: EndDate;
  episodes: number;
  format: string;
  genres: string[];
  favourites: number;
  id: number;
  idMal: number;
  meanScore: number;
  season: string;
  seasonYear: number;
  status: string;
  studios: Studios;
  synonyms: string[];
  title: Title;
  trailer: Trailer;
  type: string;
  nextAiringEpisode: NextAiringEpisode;
}

const CoverImageSchema: Schema = new Schema({
  extraLarge: { type: String, default: "" },
  large: { type: String, default: "" },
  medium: { type: String, default: "" },
  color: { type: String, default: "" },
});

const EndDateSchema: Schema = new Schema({
  year: { type: Number, default: 0 },
  month: { type: Number, default: 0 },
  day: { type: Number, default: 0 },
});

interface Trailer extends Document {
  id: string;
  site: string;
  thumbnail: string;
}

const TrailerSchema: Schema = new Schema({
  id: { type: String, default: "" },
  site: { type: String, default: "" },
  thumbnail: { type: String, default: "" },
});

const StudioNodeSchema: Schema = new Schema({
  id: { type: Number, default: 0 },
  isAnimationStudio: { type: Boolean, default: false },
  favourites: { type: Number, default: 0 },
  name: { type: String, default: "" },
  siteUrl: { type: String, default: "" },
});

const StudioEdgeSchema: Schema = new Schema({
  id: { type: Number, default: 0 },
  isMain: { type: Boolean, default: false },
  node: { type: StudioNodeSchema, default: () => ({}) },
});

const StudiosSchema: Schema = new Schema({
  edges: { type: [StudioEdgeSchema], default: [] },
});

const TitleSchema: Schema = new Schema({
  romaji: { type: String, default: "" },
  english: { type: String, default: "" },
  native: { type: String, default: "" },
  userPreferred: { type: String, default: "" },
});

const NextAiringEpisodeSchema: Schema = new Schema({
  id: { type: Number, default: 0 },
  airingAt: { type: Number, default: 0 },
  timeUntilAiring: { type: Number, default: 0 },
  episode: { type: Number, default: 0 },
  mediaId: { type: Number, default: 0 },
});

const MediaSchema: Schema = new Schema({
  bannerImage: { type: String, default: "" },
  averageScore: { type: Number, default: 0 },
  coverImage: { type: CoverImageSchema, default: () => ({}) },
  countryOfOrigin: { type: String, default: "" },
  description: { type: String, default: "" },
  duration: { type: Number, default: 0 },
  endDate: { type: EndDateSchema, default: () => ({}) },
  episodes: { type: Number, default: 0 },
  format: { type: String, default: "" },
  genres: { type: [String], default: [] },
  favourites: { type: Number, default: 0 },
  id: { type: Number, default: 0 },
  idMal: { type: Number, default: 0 },
  meanScore: { type: Number, default: 0 },
  season: { type: String, default: "" },
  seasonYear: { type: Number, default: 0 },
  status: { type: String, default: "" },
  studios: { type: StudiosSchema, default: () => ({}) },
  synonyms: { type: [String], default: [] },
  title: { type: TitleSchema, default: () => ({}) },
  trailer: {
    type: { id: String, site: String, thumbnail: String },
    default: () => ({}),
  },
  type: { type: String, default: "" },
  nextAiringEpisode: { type: NextAiringEpisodeSchema, default: () => ({}) },
});

const Media = mongoose.model<Media>("Media", MediaSchema);

export { Media as TrendingMedia, MediaSchema as TrendingMediaSchema };
