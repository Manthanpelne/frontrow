"use client";

import { getMovies, getMoviesFilter } from "@/actions/movie-listing";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Loader2, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

let limit = 8;

const MoviePage = () => {
  const [search, setSearch] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [languages, setLanguages] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const languageFilterFromUrl = searchParams.get("language") || "";
  const currentPageFromUrl = parseInt(searchParams.get("page")) || 1;

  // Debouncing for Search Input
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => {
      clearTimeout(timerId);
    };
  }, [search]);

  //useEffect to handle params during debouncingSearch ie if only search is triggered then only page should be resetted to 1
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    //if searched, update the search param based on debounced value
    if (debouncedSearch) {
      if (searchParams.get("search") !== debouncedSearch) {
        params.set("search", debouncedSearch);
        params.set("page", "1");
      }
    } else {
      if (searchParams.has("search")) {
        params.delete("search");
        params.set("page", "1");
      }
    }

    const newUrl = `${pathname}?${params.toString()}`;
    if (newUrl !== `${pathname}?${params.toString()}`) {
      router.push(newUrl);
    }
  }, [debouncedSearch, pathname, router]);

  //useEffect for handling filter
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const result = await getMoviesFilter();
        if (result.success) {
          console.log("lang", result.data.languages);
          setLanguages(result.data.languages);
        }
      } catch (error) {
        console.log("error loading filters", error);
        toast.error("Failed to load language filters");
      }
    };
    fetchFilters();
  }, []);

  //fetching movie data , triggering on url change or search
  const fetchMovies = useCallback(async () => {
    setLoading(true);
    const pageToFetch = parseInt(searchParams.get("page")) || 1;
    const languageToFetch = searchParams.get("language") || null;

    try {
      const result = await getMovies(
        debouncedSearch,
        languageToFetch,
        pageToFetch,
        limit
      );
      if (result?.success) {
        console.log("movies", result.movies);
        setMovies(result.movies);
        //console.log("movies",result.movies)
        setTotalPages(result.totalPages);
      } else {
        toast.error("Failed to fetch movies");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch movies");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, searchParams]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  //handlers
  const handleLanguageChange = (newLanguage) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newLanguage) {
      params.set("language", newLanguage);
    } else {
      params.delete("language");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams.toString())
    if(newPage >=1 && newPage <= totalPages){
      //setting new "page" parameter to page number in url
      params.set("page", newPage.toString())
      router.push(`${pathname}?${params.toString()}`)
      window.scrollTo({top:0, behavior:"smooth"})
    }
  };

  const getPageNumbers = (totalPages) => {
  return Array.from({ length: totalPages }, (_, i) => i + 1);
};

  return (
    <section className="max-w-screen-2xl mx-auto px-4 sm:px-12">
      <h1 className="text-2xl md:text-4xl font-extrabold pt-5 mb-6">Browse Movies Shows</h1>

      {/* search & filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Select
          value={languageFilterFromUrl}
          onValueChange={handleLanguageChange}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Languages" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex w-full md:w-1/2 items-center gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              value={search}
              type="search"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search movies, shows, concerts, standups, etc..."
              className="pl-9 w-full placeholder:text-xs placeholder:text-gray-400"
            />
          </div>
        </form>
      </div>

      <div className="mt-5 md:mt-8">
        {/* movie listing */}
        {loading ? (
          <div className="flex justify-center items-center h-64 opacity-35">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <span className="">Loading...</span>
          </div>
        ) : (
          <>
            {movies.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-12">
                {movies.map((movie) => (
                  <Link href={`/movies/${movie.id}`} key={movie.id}>
                    <div
                      key={movie.title}
                      className="bg-white rounded-lg shadow-lg transform hover:scale-[1.02] transition duration-300 cursor-pointer"
                    >
                      <div className="h-[300px] p-4 overflow-hidden">
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="rounded-lg drop-shadow-xl"
                      />
                      </div>
                      <div className="p-3">
                        <div className="flex mb-1 items-center justify-between gap-4">
                          <h3 className="font-semibold text-sm text-gray-900 w-[50%] truncate">
                            {movie.title}
                          </h3>
                          <div>
                            <p className="text-xs text-yellow-500 font-bold">
                              ⭐ {movie.rating}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">
                          {movie.genre}
                        </p>
                        <p className="text-xs truncate">{movie.language}</p>
                        <button className="mt-2 w-full cursor-pointer bg-black/90 text-[#ECF86E] py-1 rounded text-sm font-bold hover:bg-black transition-all duration-300">
                          Book Tickets
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center absolute top-1/2 left-1/2 -translate-x-1/2 opacity-30 text-xl">
                No movies found matching your criteria.
              </div>
            )}

            {/* Pagination i'll do it afterwards */}
            {totalPages>1 && (
              <div className="flex justify-center items-center space-x-2 mt-12">
                {/* Previous Button */}
                <button
                onClick={()=>handlePageChange(currentPageFromUrl - 1)}
                disabled={currentPageFromUrl === 1}
                className="px-4 py-2 text-sm font-semibold rounded-lg border transition-colors duration-200 
                   disabled:opacity-50 disabled:cursor-not-allowed bg-black/90 text-[#ECF86E] 
                   hover:bg-black"
                >
                  Previous
                </button>
                
                {/* Page Numbers */}
               {getPageNumbers(totalPages).map((pageNumber) => (
              <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-colors duration-200 
                      ${currentPageFromUrl === pageNumber
                          ? "bg-[#ECF86E] text-black border-black/90" // Active page style
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100" // Inactive page style
                      }`}
              >
                  {pageNumber}
              </button>
            ))}
                
                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPageFromUrl + 1)}
                  disabled={currentPageFromUrl === totalPages}
                  className="px-4 py-2 text-sm font-semibold rounded-lg border transition-colors duration-200 
                            disabled:opacity-50 disabled:cursor-not-allowed bg-black/90 text-[#ECF86E] 
                            hover:bg-black"
              >
                  Next
              </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default MoviePage;
