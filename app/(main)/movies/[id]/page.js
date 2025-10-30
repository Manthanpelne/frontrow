import React from 'react';
import MovieDetailsPage from './components/movie-details';
import { db } from '@/lib/prisma';

const Page = async ({ params }) => {
    // 1. CORRECT: Access 'id' directly from the params object
    const { id } = await params;

    // 2. CORRECT: Use findUnique with a 'where' clause, and destructure the result correctly
    const movie = await db.movie.findUnique({
        where: {
            id: id,
        },
        // It's a good practice to include related models if needed for MovieDetailsPage
        include: {
            showtimes: {
                include: {
                    seatPrices: true,
                },
            },
        },
    });
    console.log("moviedetail",movie)

    // Handle case where movie is not found
    if (!movie) {
        return <div>Movie not found.</div>;
    }
    
    // 3. CORRECT: Pass the object to the child component
    return (
        <section className='max-w-screen-2xl mx-auto px-4 sm:px-12 mt-20'>        
            {/* Pass the fetched movie data to the component */}
            <MovieDetailsPage movie={movie} />
        
        </section>
    );
};

export default Page;