import React, { useState, useEffect, useCallback } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { tmdbService } from '../services/tmdb';
import { Movie } from '../types';
import { PosterCard } from '../components/MovieRow';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await tmdbService.search(searchQuery);
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-3xl mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-8 font-display">Search</h1>
          <div className="relative">
            <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500" size={24} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Movies, TV Shows, and More"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-14 text-xl focus:outline-none focus:bg-white/10 transition-all placeholder:text-zinc-600"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X size={24} />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
            {results.map((movie) => (
              <PosterCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="text-center py-20">
            <p className="text-zinc-500 text-lg">No results found for "{query}"</p>
          </div>
        )}

        {!query && (
          <div className="py-10">
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest opacity-50">Discover something new</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
