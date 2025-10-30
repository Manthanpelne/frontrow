import { Star, Calendar, Clock, User, Users, Tag, Globe } from "lucide-react";
import Link from "next/link";

const MovieDetailsPage = ({ movie }) => {
  // Helper to format the release date
  const releaseDate = new Date(movie?.releaseDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const backdropUrl = movie?.backdrop
    ? movie.backdrop // Use the full URL if it's external (Supabase)
    : `/${movie?.backdrop}`;

  return (
    // Added bg-gray-900 and p-4 md:p-10 here for the page background
    <div className="min-h-screen">
      {/* --- Main Content Section (Poster and Details) --- */}
      <div className="flex flex-col md:flex-row gap-8 text-white">
        {/* Poster Image (Visible only on smaller screens) */}
        <div className="md:hidden">
          <img
            src={movie?.poster}
            alt={movie?.title}
            className="w-full h-auto object-cover rounded-lg shadow-xl"
          />
        </div>

        {/* Main Details and Backdrop - NOW DYNAMIC HEIGHT */}
        <div
          // 1. **Outer Container**: Height is relative to content inside.
          className="relative w-full rounded-xl overflow-hidden shadow-2xl bg-cover bg-center"
          style={{ backgroundImage: `url('${backdropUrl}')` }}
        >
          {/* 2. **Gradient/Dark Overlay**: Absolute to cover parent background. */}
          <div className="absolute inset-0 bg-linear-to-t from-black to-black/60"></div>

          {/* 3. **Content Layer**: Normal flow, defining the height with content and padding. */}
          <div className="relative p-6 md:p-14 flex flex-col gap-6">
            {/* Inner Wrapper for Poster and Details (Uses Flex-row on md screens) */}
            <div className="flex flex-col md:flex-row gap-10 items-start">
              {/* Poster (Hidden on small screens, prominent on large) */}
              <img
                src={movie?.poster}
                alt={movie?.title}
                className="hidden md:block w-48 h-auto object-cover rounded-lg shadow-xl shrink-0"
              />

              {/* Text Details Container */}
              <div className="flex flex-col justify-between w-full">
                <div>
                  <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-[#ECF86E]">
                    {movie?.title}
                  </h1>

                  {/* Rating and Votes - FILLED IN */}
                  <div className="flex items-center gap-4 mb-4">
                    <span className="flex items-center text-xl font-bold">
                      <Star
                        fill="rgb(253 224 71)"
                        className="w-5 h-5 text-[#ECF86E] mr-1"
                        strokeWidth={1}
                      />
                      {movie?.rating} / 10
                    </span>
                    <span className="text-sm text-gray-400">
                      ({movie?.votes} votes)
                    </span>
                    <span className="text-sm border border-gray-500 rounded px-2 py-0.5 ml-2 flex items-center">
                      <Globe className="w-3 h-3 mr-1" />
                      {movie?.language}
                    </span>
                  </div>

                  {/* Metadata Grid - FILLED IN */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-6 text-sm mb-6">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-400 font-semibold">
                        Release:
                      </span>
                      <span className="ml-2 font-medium">{releaseDate}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-400 font-semibold">
                        Duration:
                      </span>
                      <span className="ml-2 font-medium">
                        {movie?.duration}
                      </span>
                    </div>
                    <div className="flex items-center sm:col-span-1">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-400 font-semibold">
                        Director:
                      </span>
                      <span className="ml-2 font-medium truncate">
                        {movie?.director}
                      </span>
                    </div>
                    <div className="flex items-center col-span-2 sm:col-span-3">
                      <Tag className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-400 font-semibold">
                        Genre:
                      </span>
                      <span className="ml-2 font-medium">
                        {movie?.genre.join(" / ")}
                      </span>
                    </div>
                  </div>

                  {/* Cast - FILLED IN */}
                  <p className="text-lg font-bold mb-2 flex items-start">
                    <Users className="w-5 h-5 text-gray-400 mr-3 mt-1 shrink-0" />
                    <span className="text-gray-400 font-semibold">Cast:</span>
                    <span className="ml-3 font-normal text-gray-300 flex flex-wrap">
                      {movie?.cast?.map((actor, index) => (
                        <span
                          key={actor}
                          className="mr-3 hover:text-[#ECF86E] transition-colors cursor-pointer"
                        >
                          {actor}
                          {index < movie.cast.length - 1 ? "," : ""}
                        </span>
                      ))}
                    </span>
                  </p>
                </div>

                <hr className="my-5 border-white/40" />

                {/* Synopsis */}

                <p className="text-gray-300 leading-relaxed italic text-sm ">
                  {movie?.synopsis}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Showtimes Section --- */}
      <div className="mt-8">
        <h2 className="text-3xl font-extrabold mb-4">Showtimes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {movie?.showtimes?.map((showtime) => {
            //first: stringifying the seatPrices array
            const seatPriceString = JSON.stringify(showtime.seatPrices);
            // 2. Encode the string for use in a URL
            const encodedSeatPrices = encodeURIComponent(seatPriceString);

            // 3. Construct the URL with the seatPrices as a query parameter
            const bookingHref = `/movies/${movie?.id}/booking/${showtime?.id}?prices=${encodedSeatPrices}`;

            return (
              <Link
                href={bookingHref}
                key={showtime.id}
                className={`p-4 rounded-lg shadow-lg transition-all transform hover:scale-[1.02] cursor-pointer 
                ${
                  showtime.filling === "Fast"
                    ? "bg-red-100 border-2 border-red-200"
                    : showtime.filling === "Medium"
                    ? "bg-blue-100 border-2 border-blue-200"
                    : "bg-green-100 border-2 border-green-200"
                }
              `}
              >
                <p className="text-2xl font-bold mb-1 flex items-center">
                  <Clock className="w-5 h-5 mr-2" /> {showtime.time}
                </p>
                <p className="text-black font-semibold text-sm mb-2">
                  Theater: {showtime.theater}
                </p>
                <p className="text-sm font-semibold">
                  Filling:{" "}
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                      showtime.filling === "Fast"
                        ? "bg-red-700 text-white"
                        : showtime.filling === "Medium"
                        ? "bg-blue-800 text-white"
                        : "bg-green-700 text-white"
                    }`}
                  >
                    {showtime.filling}
                  </span>
                </p>
                <div className="mt-3 border-t border-black/30 pt-3">
                  <p className="text-xs text-black font-semibold mb-1">
                    Price Options:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {showtime.seatPrices?.map((price, index) => (
                      <span
                        key={index}
                        className="text-xs tracking-wide bg-[#f5f8a2] text-black border border-black px-2 py-1 rounded-full flex items-center"
                      >
                        <span className="mr-1">{price.seatType}:</span>
                        <span className="font-bold">
                          ₹ {price.price.toString()}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsPage;
