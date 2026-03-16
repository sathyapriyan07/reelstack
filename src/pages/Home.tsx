import React, { useEffect, useState } from 'react';
import { Hero } from '../components/Hero';
import { MovieRow } from '../components/MovieRow';
import { tmdbService } from '../services/tmdb';
import { Movie } from '../types';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

const Home = () => {
  const { user } = useAuth();
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [latest, setLatest] = useState<Movie[]>([]);
  const [popularTV, setPopularTV] = useState<Movie[]>([]);
  const [action, setAction] = useState<Movie[]>([]);
  const [comedy, setComedy] = useState<Movie[]>([]);
  const [continueWatching, setContinueWatching] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          trendingData,
          popularMoviesData,
          topRatedData,
          latestData,
          popularTVData,
          actionData,
          comedyData
        ] = await Promise.all([
          tmdbService.getTrending(),
          tmdbService.getPopular('movie'),
          tmdbService.getTopRated('movie'),
          tmdbService.getLatest('movie'),
          tmdbService.getPopular('tv'),
          tmdbService.getMoviesByGenre(28), // Action
          tmdbService.getMoviesByGenre(35), // Comedy
        ]);

        setTrending(trendingData);
        setPopularMovies(popularMoviesData);
        setTopRated(topRatedData);
        setLatest(latestData);
        setPopularTV(popularTVData);
        setAction(actionData);
        setComedy(comedyData);

        if (user) {
          try {
            const q = query(
              collection(db, 'continue_watching'),
              where('userId', '==', user.uid),
              orderBy('updatedAt', 'desc'),
              limit(10)
            );
            const snapshot = await getDocs(q);
            const cwData = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: data.tmdbId,
                tmdbId: data.tmdbId,
                title: data.title,
                poster_path: data.posterPath,
                media_type: data.mediaType,
                overview: '',
                backdrop_path: '',
                release_date: '',
                vote_average: 0,
                genre_ids: []
              } as Movie;
            });
            setContinueWatching(cwData);
          } catch (cwError) {
            console.warn('Continue watching query failed (likely missing index):', cwError);
            // Fallback: fetch without ordering if index fails
            const qSimple = query(
              collection(db, 'continue_watching'),
              where('userId', '==', user.uid),
              limit(10)
            );
            const snapshotSimple = await getDocs(qSimple);
            const cwDataSimple = snapshotSimple.docs.map(doc => {
              const data = doc.data();
              return {
                id: data.tmdbId,
                tmdbId: data.tmdbId,
                title: data.title,
                poster_path: data.posterPath,
                media_type: data.mediaType,
                overview: '',
                backdrop_path: '',
                release_date: '',
                vote_average: 0,
                genre_ids: []
              } as Movie;
            });
            setContinueWatching(cwDataSimple);
          }
        }
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <Hero movies={trending.slice(0, 5)} />
      
      <div className="relative z-10 mt-6 md:mt-10 lg:mt-12">
        {continueWatching.length > 0 && (
          <MovieRow title="Continue Watching" movies={continueWatching} />
        )}
        <MovieRow title="Trending Now" movies={trending} />
        <MovieRow title="Popular Movies" movies={popularMovies} />
        <MovieRow title="Top Rated" movies={topRated} />
        <MovieRow title="Latest Movies" movies={latest} />
        <MovieRow title="Popular TV Shows" movies={popularTV} />
        <MovieRow title="Action Movies" movies={action} />
        <MovieRow title="Comedy Movies" movies={comedy} />
      </div>
    </div>
  );
};

export default Home;
