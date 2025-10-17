"use client"

import { getMovies, getMoviesFilter } from '@/actions/movie-listing'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Search } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

 const metadata = {
  title: 'Movies | FrontRow',
  description: 'Browse movies and book movie tickets'
}


let limit = 1

const MoviePage = () => {

    const [search, setSearch] = useState("");
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [languages, setLanguages] = useState([]); 
    const [totalPages, setTotalPages] = useState(1);
 
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const languageFilterFromUrl = searchParams.get("language") || "";
  const currentPageFromUrl = parseInt(searchParams.get("page")) || 1;


  // Debouncing for Search Input
   useEffect(()=>{
    const timerId = setTimeout(()=>{
      setDebouncedSearch(search)
    },500)
    return () => {
      clearTimeout(timerId)
    }
   },[search])


   //useEffect to handle params during debouncingSearch ie if only search is triggered then only page should be resetted to 1
   useEffect(()=>{
      const params = new URLSearchParams(searchParams.toString())
      //if searched, update the search param based on debounced value
      if(debouncedSearch){
        if(searchParams.get("search") !== debouncedSearch){
          params.set("search",debouncedSearch)
          params.set("page","1")
        }
      }else{
        if(searchParams.has("search")){
          params.delete("search")
          params.set("page","1")
        }
      }

      const newUrl = `${pathname}?${params.toString()}`
      if(newUrl !== `${pathname}?${params.toString()}`){
        router.push(newUrl)
      }
   },[debouncedSearch, pathname, router])



   //useEffect for handling filter
  useEffect(()=>{
    const fetchFilters = async()=>{
      try {
        const result = await getMoviesFilter()
        if(result.success){
          console.log("lang",result.data.languages)
          setLanguages(result.data.languages)
        }
      } catch (error) {
        console.log("error loading filters",error)
        toast.error("Failed to load language filters")
      }
    }
    fetchFilters()
  },[])



//fetching movie data , triggering on url change or search 
const fetchMovies = useCallback(async()=>{
  setLoading(true)
  const pageToFetch = parseInt(searchParams.get("page")) || 1
  const languageToFetch = searchParams.get("language") || null

  try {
    const result = await getMovies(debouncedSearch, languageToFetch, pageToFetch, limit)
    if(result.success){
      console.log("movies",result.movies)
      setMovies(result.movies)
      setTotalPages(result.totalPages)
    }else{
      toast.error("Failed to fetch movies")
    }
  } catch (error) {
   console.error(error)
   toast.error("Failed to fetch movies")
  }
  finally{
    setLoading(false)
  }
},[debouncedSearch, searchParams])


useEffect(()=>{
 fetchMovies()
},[fetchMovies])



//handlers
const handleLanguageChange = (newLanguage)=>{
const params = new URLSearchParams(searchParams.toString())
if(newLanguage){
  params.set("language",newLanguage)
}else{
  params.delete("language")
}
params.set("page","1")
router.push(`${pathname}?${params.toString()}`);
}

const handlePageChange=(newPage)=>{

}


  return (
    <div>
      <h1 className='text-4xl font-bold mb-4'>Browse Movies shows</h1>
     
      {/* search & filter */}
       <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
           
            <form onSubmit={(e)=> e.preventDefault()} className='flex w-full items-center gap-4 sm:w-auto'>
              <div className='relative flex-1'>
                <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-500'/>
                <Input
                value={search}
                type="search"
                onChange={(e)=>setSearch(e.target.value)}
                placeholder="Search movies..."
                 className="pl-9 w-full sm:w-60" />
              </div>
            </form>

           <Select value={languageFilterFromUrl} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Languages" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang)=>(
                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
              ))}
            </SelectContent>
          </Select>

         </div>

    
        <div>
                {/* movie listing */}
                {loading ? (
                    <div className="flex justify-center items-center h-64 text-indigo-600">
                        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                        <span className="text-xl">Loading movies...</span>
                    </div>
                ) : (
                    <>
                        {movies.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {movies.map(movie => (
                                  <Link href={`/movies/${movie.title}`} key={movie.id}>
                                    <div className="bg-white shadow-lg rounded-xl p-4 transition-transform hover:scale-[1.02]">
                                        <h3 className="text-xl font-semibold truncate">{movie.title}</h3>
                                        <p className="text-sm text-gray-600">{movie.language} | {movie.duration || 'N/A'}</p>
                                        <p className="text-xs text-yellow-500">Rating: {movie.rating?.toFixed(1) || 'N/A'}</p>
                                    </div>
                                  </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500 text-xl">
                                No movies found matching your criteria.
                            </div>
                        )}
                        
                        {/* Pagination i'll do it afterwards */}
                         
                    </>
                )}
            </div>
   

     
    </div>
  )
}

export default MoviePage