# Madara Mappings

A database with anime mappings from almost all sites and anime lists.

## Available Sites

- 9anime
- Gogoanime
- HiAnime
- Crunchyroll
- Netflix
- Hulu
- TheTVDatabase (TVDB)
- The Movie Database (TMDB)
- MyAnimeList (MAL)
- Anilist
- AniSearch
- AniDB
- Kitsu
- AnimePlanet
- NotifyMoe
- Livechart
- IMDB

## Self Host Guide

Please note that you need to have a MongoDB database with 1GB+ storage to add all anime.

### Fork and Install

1. Fork the repository and then clone your forked repository:

   ```sh
   git clone https://github.com/codeblitz97/madara-mappings
   ```

2. Rename `.env.example` to `.env` and follow the instructions to add environment variables.

3. You can either run with Docker:

   ```docker
   docker build -t m-map .

   sudo docker run -d --restart unless-stopped -p 3000:3000 --name m-map-con m-map
   ```

4. Or run with Bun:

   ```sh
   bun src/index.ts
   ```
