"use client"

import { deleteMovies, getMovies } from '@/actions/movies'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Plus, Search, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

const MoviesList = () => {

  const [search, setSearch] = useState("")
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const router = useRouter()

   useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 700); // 500ms delay

    return () => {
      clearTimeout(timerId);
    };
  }, [search]);


  //api for fetching data
  const fetchMovies = useCallback(async()=>{
    setLoading(true)
    try {
      const result = await getMovies(debouncedSearch)
      if(result.success){
         console.log(result.movies)
         setMovies(result.movies)
      }
    } catch (error) {
       toast.error("Failed to fetch movies")
       console.log(error)
    }finally{
    setLoading(false)
    }
  },[debouncedSearch])

  useEffect(()=>{
   fetchMovies()
  },[fetchMovies])


  const handleDelete= async(movieId, movieTitle)=>{
    if(!window.confirm(`Are you sure you want to delete the movie ${movieTitle}`)){
      return;
    }
   toast.loading(`Deleting ${movieTitle}...`, { id: 'deleteToast' });

   try {
    const result = await deleteMovies(movieId)
       if (result.success) {
      toast.success(`${movieTitle} deleted successfully.`, { id: 'deleteToast' });
      // Re-fetch the movie list to refresh the UI
      fetchMovies(); 
    } else {
      toast.error(result.message || `Failed to delete ${movieTitle}.`, { id: 'deleteToast' });
    }
   } catch (error) {
    toast.error("An unexpected error occurred during deletion.", { id: 'deleteToast' });
    console.error("Client delete error:", error);
   }
  }

  return (
    <div className='space-y-4 max-w-screen-2xl mx-auto'>

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

            <Button onClick={()=>router.push("/admin/movies/create")} className="cursor-pointer shadow-lg hover:shadow-xl bg-[#322f2f] hover:bg-black flex items-center w-full md:w-60 gap-1">
              <Plus className='w-4 h-4'/>
              Add Movie</Button>
         </div>

    {/* movies list */}
    <div className="bg-white mt-10 shadow-md border rounded-xl overflow-x-scroll">
        {loading ? (
          <div className="flex justify-center text-sm items-center p-12 opacity-35">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <span>Loading Data...</span>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#f1f1f1]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/4">Title</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Duration</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Theater & showtimes</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Created At</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movies.length > 0 ? (
                movies.map((movie) => (
                  <tr key={movie.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-xs cursor-pointer hover:text-indigo-600"
                        onClick={() => router.push(`/admin/movies/edit/${movie.id}`)}>
                        {movie.title}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">{movie.rating.toFixed(1)} / 10</td>
                    <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{movie.duration}</td>
                    <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                   {movie.showtimes.map((th)=>(
                      <p key={th.id} className='flex items-center justify-center  text-center text-sm pb-1'>
                        <span className='font-semibold pr-1'>{th?.theater}</span> {" "} - {" "} {th?.time}
                      </p>
                    ))}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                      {new Date(movie.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <Link
                        href={`/admin/movies/edit/${movie.id}`}
                        size="icon"
              

                        className="p-3 bg-green-100 rounded-lg text-green-600 transition-all duration-300 hover:bg-green-200 cursor-pointer"
                      >
                         Edit
                      </Link>
                        <Button
                        size="icon"
                        onClick={() => handleDelete(movie.id, movie.title)}
                        title={`Delete ${movie.title}`}
                        className="h-8 w-8 ml-4 bg-red-400 transition-all duration-300 hover:bg-red-500 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-500 text-lg">
                    {debouncedSearch ? "No movies found matching your search." : "No movies available in the database."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
    </div>
    
    </div>
  )
}

export default MoviesList