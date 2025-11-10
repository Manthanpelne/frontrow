import React from 'react'
import { db } from '@/lib/prisma';
import EditMoviesForm from '../../components/edit-movies';

// Helper function to process the nested price field
const serializeMovieData = (movie) => {
    // 1. Convert the movie object to a plain JavaScript object
    const plainMovie = JSON.parse(JSON.stringify(movie));

    // 2. Iterate and convert Decimal prices to numbers
    const processedMovie = {
        ...plainMovie,
        showtimes: plainMovie.showtimes.map(showtime => ({
            ...showtime,
            seatPrices: showtime.seatPrices.map(seatPrice => ({
                ...seatPrice,
                // The Decimal object becomes a string after JSON.stringify/parse.
                // Convert that string price back to a standard JavaScript Number.
                price: parseInt(seatPrice.price, 10),
            })),
        })),
    };
    return processedMovie;
}


const EditMoviePage = async({params}) => {
    const { id } = await params; // No need for 'await params'
  console.log(id)
    const movie = await db.movie.findUnique({
        where: {
            id: id,
        },
        include: {
            showtimes: {
                include: {
                    seatPrices: true,
                },
            },
        },
    });
    
    // Handle case where movie is not found
    if (!movie) {
        return <div>Movie not found.</div>;
    }

    // ⭐ KEY CHANGE: Convert the Decimal object to a plain number before passing to the Client Component
    const movieDataForClient = serializeMovieData(movie); 
    
    //console.log("moviedetail", movieDataForClient); 
    
    return (
        <section className='max-w-screen-2xl mx-auto px-4 sm:px-12 mt-20'>         
            {/* Pass the fully processed data */}
            <EditMoviesForm movie={movieDataForClient} /> 
        </section>
    );
};

export default EditMoviePage