"use server";

import { auth } from "@/auth";
import { serializeMovies } from "@/lib/helper";
import { db } from "@/lib/prisma";
import { createClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

//admin adding movies to db api
export const addMovies = async ({ moviesData, images }) => {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { authorized: false, reason: "not logged in" };
    }
    const loggedInUser = await db.user.findUnique({
      where: {
        email: session?.user?.email,
      },
    });
    if (!loggedInUser) throw new Error("User does not exist");

    const moviesId = uuidv4();
    const folderPath = `movies/${moviesId}`;

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const imageUrls = [];

    for (let i = 0; i < images.length; i++) {
      const base64Data = images[i];

      // Skip if image data is not valid
      if (!base64Data || !base64Data.startsWith("data:image/")) {
        console.warn("Skipping invalid image data");
        continue;
      }

      // Extract the base64 part (remove the data:image/xyz;base64, prefix)
      const base64 = base64Data.split(",")[1];
      const imageBuffer = Buffer.from(base64, "base64");

      // Determine file extension from the data URL
      const mimeMatch = base64Data.match(/data:image\/([a-zA-Z0-9]+);/);
      const fileExtension = mimeMatch ? mimeMatch[1] : "jpeg";

      // Create filename
      const fileName = `image-${Date.now()}-${i}.${fileExtension}`;
      const filePath = `${folderPath}/${fileName}`;

      const { data, error } = await supabase.storage
        .from("movie-images")
        .upload(filePath, imageBuffer, {
          contentType: `image/${fileExtension}`,
        });

      if (error) {
        console.error("Error uploading images", error);
        throw new error(`Error uploading image:${error.message}`);
      }
      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/movie-images/${filePath}`;
      imageUrls.push(publicUrl);
    }

    if (imageUrls.length === 0) {
      throw new Error("No valid images were uploaded");
    }

     await db.movie.create({
      data: {
        id:moviesId,
        title: moviesData.title,
        rating: moviesData.rating,
        genre: moviesData.genre,
        language: moviesData.language,
        duration: moviesData.duration,
        poster: imageUrls[0],
        backdrop: imageUrls[1] || null,
        releaseDate: new Date(moviesData.releaseDate), 
        votes: moviesData.votes,
        synopsis: moviesData.synopsis,
        cast: moviesData.cast,
        director: moviesData.director,
        showtimes: {
          create: moviesData.showtimes.map((st) => ({
            time: st.time,
            theater: st.theater,
            filling: st.filling,
            seatPrices: {
              create: st.seatPrices.map((sp) => ({
                seatType: sp.seatType,
                price: parseFloat(sp.price), // Ensure price is a number
              })),
            },
          })),
        },
      },
    });
    revalidatePath("/admin/movies");
    return {
      success: true,
      message: `${moviesData.title} movie got added successfully!`,
    };
  } catch (error) {
   console.log("Failed to add movie",error)
    return { success: false, message: "Failed to add a movie" };
  }
};


export const getMovies = async(search = "")=>{
 try {
    const session = await auth();
    if (!session?.user?.email) {
      throw new Error("Unauthorized!");
    }

    const loggedInUser = await db.user.findUnique({
      where: {
        email: session?.user?.email,
      },
    });
    if (!loggedInUser) throw new Error("User does not exist");

   
    const movies = await db.movie.findMany({
      where: {
        // Use a case-insensitive search on the 'title' field
        title: {
          contains: search,
          mode: 'insensitive', // Important for case-insensitive search in PostgreSQL
        },
      },
      // Include all necessary relations for a full movie detail view
      include: {
        showtimes: {
          include: {
            seatPrices: true, // Include seat prices nested under each showtime
          },
          orderBy: {
            time: 'asc', // Optional: Order showtimes logically
          },
        },
      },
      // Optional: Add sorting for the movies themselves (e.g., by release date)
      orderBy: {
        releaseDate: 'desc',
      }
    });
    const serializedMovies = serializeMovies(movies)
    return {
      success: true,
      movies: serializedMovies,
    };

  } catch (error) {
    console.error("Error fetching movies:", error.message);
    // Return a structured error response for the client
    return {
      success: false,
      error: "Failed to fetch movies",
    };
  }
}


//delete api
export const deleteMovies = async(movieId)=>{
 try {
    const session = await auth();
    if (!session?.user?.email) {
      throw new Error("Unauthorized: User not logged in.");
    }
    //Re-check admin status if necessary, similar to addMovies
    const loggedInUser = await db.user.findUnique({
      where: { email: session.user.email },
    });
    if (!loggedInUser) throw new Error("User does not exist.");

    await db.$transaction(async(prisma)=>{
      // 1. Get all showtimes and their IDs for the movie being deleted
      const showtimes = await prisma.showtime.findMany({
        where: { movieId: movieId },
        select: { id: true },
      });
      const showtimeIds = showtimes.map(st => st.id);

      // 2. Find and deleting all tickets for these showtimes. 
      await prisma.ticket.deleteMany({
        where: {
          showtimeId: { in: showtimeIds },
        },
      });

      //finally delete movie
      await prisma.movie.delete({
        where : {id: movieId}
      })
    })

    //update the list immediately on frontend
    revalidatePath("/admin/movies")
    return {
      success: true,
      message: "Movie and all related data deleted successfully!",
    };
  } catch (error) {
    console.log("Error deleting movie details",error)
    return { success: false, message: "Failed to delete movie" };
  }
}