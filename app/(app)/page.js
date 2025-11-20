"use client";

import { Button } from "@/components/ui/button";
import {
  Bell,
  Calendar,
  Globe,
  MapPin,
  Smartphone,
  Sparkles,
  Ticket,
  TrendingUp,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
      
  const router = useRouter()

   const handleRouteClick=()=>{
     startTransition(()=>{
       router.push("/movies/")
     })
   }

  const handleClick = (e) => {
    setIsLoading(true);
  };

  const trendingMovies = [
    {
      title: "Kantara: A Legend",
      rating: 9.3,
      genre: "Action/Thriller",
      language: "Hindi, Tamil",
      imageUrl:
        "https://i.pinimg.com/1200x/8d/fb/44/8dfb44d82eab9d3df6fb9a1b26573e01.jpg",
    },
    {
      title: "Jawan",
      rating: 8.8,
      genre: "Action/Drama",
      language: "Hindi, Tamil, Telugu",
      imageUrl:
        "https://i.pinimg.com/1200x/59/27/50/5927501eeb30666518c6b9fa309fc4be.jpg",
    },
    {
      title: "Oppenheimer",
      rating: 9.0,
      genre: "Biography/Drama",
      language: "Hindi, English",
      imageUrl:
        "https://i.pinimg.com/1200x/77/9d/a3/779da30964fb69b47c4f03138d482f9d.jpg",
    },
    {
      title: "Dune",
      rating: 9.3,
      genre: "Action/Thriller/Si-Fi",
      language: "Hindi, Tamil, Telugu",
      imageUrl:
        "https://i.pinimg.com/1200x/6a/ca/58/6aca58c43f149d1016587ad7fbedc621.jpg",
    },
    {
      title: "Mission Impossible: The final Reckoning",
      rating: 8,
      genre: "Action",
      language: "English, Hindi, Telugu",
      imageUrl:
        "https://i.pinimg.com/736x/94/39/cb/9439cbbdc229a4e984aa18d56e403500.jpg",
    },
    {
      title: "F1: The Movie",
      rating: 9.5,
      genre: "Biography/Drama",
      language: "English, Hindi",
      imageUrl:
        "https://i.pinimg.com/736x/20/62/03/206203d4e26fd4bb655eaf01783a4ff2.jpg",
    },
  ];

  const liveEvents = [
    {
      title: "The Late Night Standup Show",
      location: "Sans Fransico, US",
      price: "₹499 onwards",
      imageUrl:
        "https://i.pinimg.com/1200x/ba/90/d5/ba90d51fed18d52a602d5c6511b0a5db.jpg",
    },
    {
      title: "Global Music Fest",
      location: "Stadium Grounds",
      price: "₹999 onwards",
      imageUrl:
        "https://i.pinimg.com/736x/14/50/a7/1450a79fbc0d55f38cf00c2d7e99c51e.jpg",
    },
  ];

  const keyFeatures = [
    {
      icon: Zap,
      title: "Lightning Fast Booking",
      color: "bg-purple-100 text-purple-600",
      description:
        "Secure your tickets in under 60 seconds with our optimized checkout flow.",
    },
    {
      icon: Ticket,
      title: "Exclusive Offers & Deals",
      color: "bg-pink-100 text-pink-600",
      description:
        "Save big with special bank discounts and early-bird pricing on top events.",
    },
    {
      icon: Globe,
      title: "The Full Entertainment Hub",
      color: "bg-green-100 text-green-600",
      description:
        "From local stand-up to global concerts, find all live events here.",
    },
    {
      icon: Smartphone,
      title: "E-Tickets on Your Phone",
      color: "bg-yellow-100 text-yellow-600",
      description:
        "Go paperless! Your tickets are instantly available and scannable on the app.",
    },
  ];

  return (
    <>
      <div className="relative min-h-screen w-full">
        {/* 2. Image with repeating background and blackish bottom gradient overlay */}
            <div
          className="absolute -top-40 inset-0 bg-repeat bg-center bg-contain"
          style={{
            // Use the path relative to the 'public' directory
            backgroundImage: "url('/frontrowHero.jpg')",
          }}
        >
          {/* 3. Gradient Overlay (blackish on bottom) */}
          <div className="absolute inset-0 bg-linear-to-t from-black via-[black]/70 to-transparent"></div>
        </div>

        {/* 4. Text on the image */}
        <div className="absolute inset-x-0 bottom-36 md:bottom-40 text-center text-white p-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#ECF86E]">
            The Front Row Experience
          </h1>
          <p className="mt-2 italic md:text-xl pb-10">The best view, every time.</p>

          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-5 w-max m-auto">
            <p className="text-2xl md:text-3xl text-[#ECF86E]  font-extrabold">
              Book Your Tickets Now
            </p>
            <Link href="/movies/" passHref>
              <Button
                className="flex items-center text-xl font-extrabold tracking-wide italic h-14 bg-black text-[#ECF86E] hover:text-[#f0ff46] w-max m-auto cursor-pointer border-4 border-[#46482c] transition-all duration-300  hover:border-[#616440] rounded-tl-2xl rounded-br-2xl"
                onClick={handleClick}
                disabled={isLoading} // Optional: Disable button while loading
              >
                {isLoading ? (
                  // Display the loader here
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#ECF86E]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Loading...
                  </div>
                ) : (
                  // Display the original text
                  "Book Tickets"
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <section className="max-w-screen-2xl mx-auto px-4 sm:px-12 mt-14 md:mt-20">
        {/* 3. Trending Movies Carousel */}
        <section className="mb-14 md:mb-20">
          <div className="flex justify-between items-baseline mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              🎬 The Buzz: Trending Now
            </h2>
            <Link
              href="/movies/"
              className="text-[#5A5C3E] font-medium hover:text-red-700 transition"
            >
              View All Movies →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-3">
            {trendingMovies.map((movie) => (
              <div
                onClick={handleRouteClick}
                disabled={isPending}
                key={movie.title}
                className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-[1.02] transition duration-300 cursor-pointer"
              >
                 <Image
                src={movie.imageUrl}
                alt={movie.title}
                width={100}
                height={100}
                className="w-full h-[300px] object-cover"
            />
            {/* 2. OPTIONAL: Show a small loading overlay if desired, but image is usually better */}
            {isPending && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                     <svg className="animate-spin text-yellow-600 h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}
               
                <div className="p-3">
                  <div className="flex mb-1 items-center justify-between gap-4">
                    <h3 className="font-semibold text-sm text-gray-900 w-[50%] truncate">
                      {movie.title}
                    </h3>
                    <p className="text-xs text-yellow-500 font-bold">
                      ⭐ {movie.rating}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{movie.genre}</p>
                  <p className="text-xs truncate">{movie.language}</p>
                  <button className="mt-2 w-full cursor-pointer bg-black/90 text-[#ECF86E] py-1 rounded text-sm font-bold hover:bg-black transition-all duration-300">
                    Book Tickets
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Events and Activities Showcase */}
        <section className="mb-14 md:mb-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ✨ Weekend Plans: Top Events Near You
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {liveEvents.map((event) => (
              <div
                key={event.title}
                className="relative bg-white rounded-xl shadow-xl overflow-hidden group cursor-pointer h-0 pb-[56.25%] sm:pb-[56.25%]"
              >
                <Image
                  src={event.imageUrl}
                   width={100}
                   height={100}
                  alt={event.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Overlay with Gradient and Text */}
                <div className="absolute inset-0 p-4 flex flex-col justify-end text-right bg-linear-to-br from-transparent via-black/40 to-black/90 group-hover:to-black/80 transition-all duration-400">
                  <div className="text-white">
                    <h3 className="text-xl sm:text-2xl font-bold mb-1 drop-shadow-md">
                      {event.title}
                    </h3>
                    <div className="flex items-center justify-end text-sm sm:text-base text-gray-200 mb-1 drop-shadow-sm">
                      <MapPin className="h-4 w-4 mr-1 text-[#ECF86E]" />
                      <span>{event.location}</span>
                    </div>
                    <p className="text-lg sm:text-xl font-extrabold text-[#ECF86E] drop-shadow-lg">
                      {event.price}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href="#"
              className="text-[gray] font-semibold text-lg  transition border-b border-[#dbe75a] pb-1"
            >
              Explore All Live Experiences →
            </a>
          </div>
        </section>

        {/* Personalized Headline & Hero Banner - (Existing) */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Your Entertainment, Sorted.
          </h1>
          <p className="text-lg text-gray-600">
            Find the latest blockbusters, unmissable live events, and exclusive
            streaming content—all in one place.
          </p>
        </div>

        {/* Bank Offers Banner - (Existing) */}
        <div
          className="bg-[#fdfeec] border-l-6 border-[#ECF86E] text-[#363723] p-6 mb-12 rounded-lg"
          role="alert"
        >
          <p className="font-bold mb-2">🎉 Special Offer!</p>
          <p>
            Get flat **25% OFF** on movie tickets every weekend with your ICICI
            Bank Credit Card.{" "}
            <a href="#" className="font-semibold underline hover:text-blue-900">
              Details Here
            </a>
          </p>
        </div>

        {/* 3. Key Features Grid (New Section) */}
        <section className="mb-14 md:mb-20 bg-white md:p-8 rounded-xl">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Why Book with FrontRow?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {keyFeatures.map((feature) => (
              <div
                key={feature.title}
                className={`text-center px-4 py-8 rounded-xl shadow-md ${feature.color}`}
              >
                <feature.icon className="h-10 w-10  mx-auto mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[black]/35 font-bold">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Call to Action (CTA) - Download App (New Section) */}
        <section className="bg-black px-8 py-16 rounded-xl shadow-2xl mb-12 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-3/5 text-center md:text-left mb-6 md:mb-0">
            <h2 className="text-3xl text-[#ECF86E] font-extrabold mb-2">
              Unlock Faster Booking!
            </h2>
            <p className="text-lg text-white opacity-60">
              Download the BookMyShow app for exclusive deals, instant
              notifications, and the smoothest booking experience.
            </p>
          </div>
          <div className="md:w-2/5 flex flex-col sm:flex-row justify-center md:justify-end space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Placeholder for App Store Button */}
            <button className="bg-[#2e2b2b] text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center shadow-lg">
              <Smartphone className="h-5 w-5 mr-2" /> App Store
            </button>
            {/* Placeholder for Google Play Button */}
            <button className="bg-[#2e2b2b] text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center shadow-lg ">
              <Smartphone className="h-5 w-5 mr-2" /> Google Play
            </button>
          </div>
        </section>
      </section>
    </>
  );
}
