// Helper function to safely convert Decimal values to strings
export const serializeMovies = (movies) => {
  return movies.map(movie => ({
    // Use the spread operator to copy all other properties
    ...movie,
    // Convert showtimes
    showtimes: movie.showtimes.map(showtime => ({
      ...showtime,
      // Convert seatPrices
      seatPrices: showtime.seatPrices.map(priceItem => ({
        ...priceItem,
        // CRITICAL FIX: Convert Decimal price object to string
        price: priceItem.price.toString(), 
      })),
    })),
  }));
};