"use server";

import { auth } from "@/auth";
import { serializeMovies } from "@/lib/helper";
import { db } from "@/lib/prisma";

export async function getMoviesFilter() {
  try {
    const language = await db.movie.findMany({
      select: { language: true },
      distinct: ["language"],
      orderBy: { language: "asc" },
    });
    const languageArray = language.map((item) => item.language);
    //console.log("languages", languageArray);
    return {
      success: true,
      data: {
        languages: languageArray,
      },
    };
  } catch (error) {
    console.error("error fetching movie filters", error);
    throw new Error("Error fetching movie filters");
  }
}


export const getMovies = async (
  search = "",
  languageFilter = null,
  page = 1,
  limit = 1
) => {
  try {
    
    //pagination
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    const where = {
      title: {
        contains: search,
        mode: "insensitive",
      },
    };

    if (languageFilter) {
      where.language = languageFilter;
    }

    const [movies, totalMoviesCount] = await db.$transaction([
      db.movie.findMany({
        where: where,
        take: take,
        skip: skip,
        include: {
          showtimes: {
            include: { seatPrices: true },
            orderBy: { time: "asc" },
          },
        },
        orderBy: { releaseDate: "desc" },
      }),
      //count no. of movies for totalcount
      db.movie.count({ where: where }),
    ]);
    const serializableMovies = serializeMovies(movies);
    //revalidatePath("/movies")
    return {
      success: true,
      movies: serializableMovies,
      totalCount: totalMoviesCount,
      totalPages: Math.ceil(totalMoviesCount / take),
      currentPage: parseInt(page),
      limit: take,
    };
  } catch (error) {
    console.error("error fetching movies", error.message);
  }
};
