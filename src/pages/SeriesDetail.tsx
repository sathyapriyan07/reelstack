import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Plus, Check, Star, Calendar, ChevronDown } from 'lucide-react';
import { tmdbService } from '../services/tmdb';
import { Movie, Episode } from '../types';
import { MovieRow } from '../components/MovieRow';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc, onSnapshot, collection, query, where } from 'firebase/firestore';

const SeriesDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [series, setSeries] = useState<Movie | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [seriesData, similarData] = await Promise.all([
          tmdbService.getDetails('tv', parseInt(id)),
          tmdbService.getSimilar('tv', parseInt(id)),
        ]);
        setSeries(seriesData);
        setSimilar(similarData);
        
        const episodesData = await tmdbService.getEpisodes(parseInt(id), 1);
        setEpisodes(episodesData);
      } catch (error) {
        console.error('Error fetching series details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchEpisodes = async () => {
      const data = await tmdbService.getEpisodes(parseInt(id), selectedSeason);
      setEpisodes(data);
    };
    fetchEpisodes();
  }, [id, selectedSeason]);

  useEffect(() => {
    if (!user || !id) return;

    const q = query(
      collection(db, 'watchlist'),
      where('userId', '==', user.uid),
      where('tmdbId', '==', parseInt(id))
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIsInWatchlist(!snapshot.empty);
    });

    return () => unsubscribe();
  }, [user, id]);

  const toggleWatchlist = async () => {
    if (!user || !series) return;

    const watchlistId = `${user.uid}_${series.id}`;
    if (isInWatchlist) {
      await deleteDoc(doc(db, 'watchlist', watchlistId));
    } else {
      await setDoc(doc(db, 'watchlist', watchlistId), {
        userId: user.uid,
        tmdbId: series.id,
        mediaType: 'tv',
        title: series.name,
        posterPath: series.poster_path,
        addedAt: Date.now(),
      });
    }
  };

  if (loading || !series) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-black">
      {/* Hero Banner */}
      <div className="relative h-[70vh] md:h-[85vh] w-full">
        <img
          src={tmdbService.getImageUrl(series.backdrop_path, 'original') || 'https://via.placeholder.com/1920x1080?text=No+Backdrop'}
          alt={series.name}
          className="w-full h-full object-cover opacity-50"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1920x1080?text=No+Backdrop';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        
        <div className="absolute inset-0 flex items-end pb-12 md:pb-20">
          <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 w-full overflow-hidden">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-zinc-300 mb-6 uppercase tracking-widest">
                <div className="flex items-center gap-1 text-white">
                  <Star size={14} fill="currentColor" />
                  <span>{series.vote_average.toFixed(1)}</span>
                </div>
                <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                <span>{(series.first_air_date || '').split('-')[0]}</span>
                <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                <span className="px-1.5 py-0.5 border border-zinc-600 rounded text-[10px]">
                  {series.number_of_seasons} SEASONS
                </span>
                <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                <span className="px-1.5 py-0.5 border border-zinc-600 rounded text-[10px]">4K</span>
              </div>

              <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-6 font-display leading-[0.9]">
                {series.name}
              </h1>

              <p className="text-base md:text-lg text-zinc-300 max-w-2xl line-clamp-3 md:line-clamp-none mb-10 font-medium leading-relaxed">
                {series.overview}
              </p>

              <div className="flex items-center gap-3 mt-5">
                <Link
                  to={`/watch/tv/${series.id}/1/1`}
                  className="flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-lg font-bold text-sm md:text-base hover:bg-zinc-200 transition-all active:scale-95 shadow-2xl shadow-white/10"
                >
                  <Play size={18} fill="currentColor" className="md:w-5 md:h-5" />
                  <span>Play Now</span>
                </Link>
                <button
                  onClick={toggleWatchlist}
                  className="flex items-center gap-2 bg-neutral-900 border border-neutral-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm md:text-base hover:bg-neutral-800 transition-all active:scale-95"
                >
                  {isInWatchlist ? <Check size={18} className="md:w-5 md:h-5" /> : <Plus size={18} className="md:w-5 md:h-5" />}
                  <span>{isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes Section */}
      <div className="py-16">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white/90">Episodes</h2>
            <div className="relative group">
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
                className="appearance-none bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-2.5 pr-12 rounded-xl font-bold text-sm focus:outline-none focus:border-white/30 transition-all cursor-pointer hover:bg-white/10"
              >
                {Array.from({ length: series.number_of_seasons || 0 }, (_, i) => (
                  <option key={i + 1} value={i + 1} className="bg-zinc-900">Season {i + 1}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 group-hover:text-white transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {episodes.map((episode) => (
              <Link
                key={episode.id}
                to={`/watch/tv/${series.id}/${selectedSeason}/${episode.episode_number}`}
                className="group block"
              >
                <div className="aspect-video relative overflow-hidden rounded-2xl border border-white/5 mb-4 bg-neutral-900">
                  <img
                    src={tmdbService.getImageUrl(episode.still_path) || 'https://via.placeholder.com/500x281?text=No+Preview'}
                    alt={episode.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500x281?text=No+Preview';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-500">
                      <Play size={24} fill="currentColor" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider">
                    {episode.runtime || 0} MIN
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-base text-white/90 group-hover:text-white transition-colors truncate pr-4">
                      {episode.name}
                    </h3>
                    <span className="text-zinc-500 font-bold text-xs shrink-0">E{episode.episode_number}</span>
                  </div>
                  <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed font-medium group-hover:text-zinc-400 transition-colors">
                    {episode.overview}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Similar Series */}
      <MovieRow title="More Like This" movies={similar} />
    </div>
  );
};

export default SeriesDetail;
