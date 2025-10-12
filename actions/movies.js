"use server";

import { auth } from "@/auth";
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
    throw new Error("Failed to add movie");
  }
};
