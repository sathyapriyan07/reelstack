import axios from 'axios';
import { Movie, Cast, Episode } from '../types';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;

const tmdb = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
  },
});

export const tmdbService = {
  getTrending: async (type: 'movie' | 'tv' | 'all' = 'all'): Promise<Movie[]> => {
    const { data } = await tmdb.get(`/trending/${type}/week`);
    return data.results || [];
  },

  getPopular: async (type: 'movie' | 'tv'): Promise<Movie[]> => {
    const { data } = await tmdb.get(`/${type}/popular`);
    return (data.results || []).map((item: any) => ({ ...item, media_type: type }));
  },

  getTopRated: async (type: 'movie' | 'tv'): Promise<Movie[]> => {
    const { data } = await tmdb.get(`/${type}/top_rated`);
    return (data.results || []).map((item: any) => ({ ...item, media_type: type }));
  },

  getLatest: async (type: 'movie' | 'tv'): Promise<Movie[]> => {
    const endpoint = type === 'movie' ? '/movie/now_playing' : '/tv/on_the_air';
    const { data } = await tmdb.get(endpoint);
    return (data.results || []).map((item: any) => ({ ...item, media_type: type }));
  },

  getMoviesByGenre: async (genreId: number): Promise<Movie[]> => {
    const { data } = await tmdb.get('/discover/movie', {
      params: { with_genres: genreId },
    });
    return (data.results || []).map((item: any) => ({ ...item, media_type: 'movie' }));
  },

  getDetails: async (type: 'movie' | 'tv', id: number): Promise<Movie> => {
    const { data } = await tmdb.get(`/${type}/${id}`);
    return { ...data, media_type: type };
  },

  getCredits: async (type: 'movie' | 'tv', id: number): Promise<Cast[]> => {
    const { data } = await tmdb.get(`/${type}/${id}/credits`);
    return (data.cast || []).slice(0, 10);
  },

  getSimilar: async (type: 'movie' | 'tv', id: number): Promise<Movie[]> => {
    const { data } = await tmdb.get(`/${type}/${id}/similar`);
    return (data.results || []).map((item: any) => ({ ...item, media_type: type }));
  },

  getEpisodes: async (tvId: number, seasonNumber: number): Promise<Episode[]> => {
    const { data } = await tmdb.get(`/tv/${tvId}/season/${seasonNumber}`);
    return data.episodes || [];
  },

  search: async (query: string): Promise<Movie[]> => {
    const { data } = await tmdb.get('/search/multi', {
      params: { query },
    });
    return (data.results || []).filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv');
  },

  getImageUrl: (path: string | null | undefined, size: 'w500' | 'original' = 'w500') => {
    if (!path) return undefined;
    return `${import.meta.env.VITE_TMDB_IMAGE_BASE_URL}/${size}${path}`;
  },
};
