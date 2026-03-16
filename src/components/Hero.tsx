import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Movie } from '../types';
import { tmdbService } from '../services/tmdb';

interface HeroProps {
  movies: Movie[];
}

const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
};

export const Hero: React.FC<HeroProps> = ({ movies }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [movies.length]);

  if (movies.length === 0) return null;

  const currentMovie = movies[currentIndex];
  const releaseYear = (currentMovie.release_date || currentMovie.first_air_date || '').split('-')[0];
  const genreName = currentMovie.genre_ids?.[0] ? GENRE_MAP[currentMovie.genre_ids[0]] : null;

  return (
    <div className="relative h-[85vh] md:h-[95vh] w-full overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          <img
            src={tmdbService.getImageUrl(currentMovie.backdrop_path, 'original') || 'https://via.placeholder.com/1920x1080?text=No+Backdrop'}
            alt={currentMovie.title || currentMovie.name}
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1920x1080?text=No+Backdrop';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex items-end pb-12 md:pb-20">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 w-full overflow-hidden">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1 text-zinc-400">
                <Star size={14} fill="currentColor" className="text-white" />
                <span className="text-xs font-bold text-white">{currentMovie.vote_average.toFixed(1)}</span>
              </div>
              {releaseYear && (
                <>
                  <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                  <span className="text-xs font-medium text-zinc-400">{releaseYear}</span>
                </>
              )}
              {genreName && (
                <>
                  <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{genreName}</span>
                </>
              )}
            </div>
            
            <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-3 font-display leading-[0.9]">
              {currentMovie.title || currentMovie.name}
            </h1>
            
            <p className="text-base md:text-lg text-zinc-300 line-clamp-2 mb-5 max-w-xl font-medium leading-relaxed">
              {currentMovie.overview}
            </p>

            <div className="flex items-center gap-3">
              <Link
                to={`/watch/${currentMovie.media_type}/${currentMovie.id}`}
                className="flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-lg font-bold text-sm md:text-base hover:bg-zinc-200 transition-all active:scale-95 shadow-2xl shadow-white/10"
              >
                <Play size={18} fill="currentColor" className="md:w-5 md:h-5" />
                <span>Play Now</span>
              </Link>
              <Link
                to={`/${currentMovie.media_type}/${currentMovie.id}`}
                className="flex items-center gap-2 bg-neutral-900 border border-neutral-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm md:text-base hover:bg-neutral-800 transition-all active:scale-95"
              >
                <Info size={18} className="md:w-5 md:h-5" />
                <span>Details</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-12 right-12 flex gap-3 z-20">
        {movies.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              idx === currentIndex ? "w-12 bg-white" : "w-3 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
