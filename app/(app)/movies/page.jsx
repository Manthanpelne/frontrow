// File Location: app/(app)/movies/page.jsx
import React, { Suspense } from 'react';
import MovieListing from './component/movie-listing'; 
import { Loader2 } from 'lucide-react'; 

// 1. Define a simple loading fallback
const LoadingFallback = () => (
    <div className="flex justify-center items-center h-64 opacity-35">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        <span className="">Loading...</span>
    </div>
);

const MoviePage = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MovieListing/> 
    </Suspense>
  );
};

export default MoviePage;