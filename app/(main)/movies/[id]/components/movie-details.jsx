import Link from 'next/link'
import React from 'react'

const MovieDetailsPage = ({movie}) => {
  return (
    <div className='text-3xl'>
      {movie.title}
       {movie.showtimes.map((showtime)=>(
        <Link href={`/movies/${movie.id}/booking/${showtime.id}`}>
             <div className='cursor-pointer flex gap-3 items-center'>
               <p className='bg-blue-50 p-3 mt-4'>{showtime.time}</p>
             </div>
        </Link>
       ))}
      </div>
      
  )
}

export default MovieDetailsPage