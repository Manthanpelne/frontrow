"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, Upload } from "lucide-react";
import z from "zod";

// --- Zod Schema Definition ---

// Schema for a single Showtime entry
const ShowtimeSchema = z.object({
  time: z.string().min(1, { message: "Time is required." }),
  theater: z.string().min(1, { message: "Theater is required." }),
  seatPrices: z.array(SeatPriceSchema).min(1, { message: "At least one SeatPrice is required." }),
  filling: z.string().min(1, { message: "Filling is required (e.g., Slow, Medium, Fast)." }),
});


const SeatPriceSchema = z.object({
  seatType: z.string().min(1, { message: "seatType is required. (eg.., VIP, Premium, Standard)" }),
  price: z.coerce.number().int({ message: "Price must be a whole number (integer)." }).min(1, { message: "Price must be greater than 0." })
});


// Schema for the entire Movie payload
const MovieSchema = z
  .object({
    title: z
      .string()
      .min(3, { message: "Title must be at least 3 characters." }),
    rating: z.coerce
      .number()
      .min(0)
      .max(10, { message: "Rating must be between 0 and 10." }),
    language: z.string().min(2, { message: "Language is required." }),
    duration: z
      .string()
      .min(3, { message: "Duration is required (e.g., 1h 45m)." }),
    releaseDate: z.string().min(8, { message: "valid date required" }),
    votes: z.string().min(1, { message: "Votes count is required." }),
    synopsis: z.string().min(10, { message: "Synopsis must be detailed." }),
    director: z.string().min(3, { message: "Director name is required." }),

    // Transform comma-separated string to an array of trimmed strings
    genreString: z
      .string()
      .min(1, { message: "At least one genre is required (comma-separated)." }),
    castString: z
      .string()
      .min(1, {
        message: "At least one cast member is required (comma-separated).",
      }),

    // Nested Showtimes (handled by useFieldArray)
    showtimes: z
      .array(ShowtimeSchema)
      .min(1, { message: "At least one showtime is required." }),

    // File inputs are tricky for Zod/RHF, we'll validate these manually or after submit
    // but we'll include placeholders to manage the files state.
    posterFile: z.any(),
    backdropFile: z.any(),
  })
  .transform((data) => ({
    ...data,
    // Final array transformation for backend API
    genre: data.genreString
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0),
    cast: data.castString
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0),
    // Remove string fields used for input
    genreString: undefined,
    castString: undefined,
  }));

// --- Helper Component for File Input (Handles Base64 Conversion) ---

const FileInput = ({ register, name, label, setFile }) => {
  const [fileName, setFileName] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    // Function to convert file to base64 string for the API payload
    const toBase64 = (f) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(f);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });

    try {
      const base64Data = await toBase64(file);
      setFile(base64Data); // Set the base64 string in the parent component's state
    } catch (error) {
      console.error("Error converting file to base64:", error);
      setFile(null);
      setFileName("");
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center space-x-2">
        <label
          htmlFor={name}
          className="flex-grow flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer transition duration-150 ease-in-out"
        >
          <Upload className="w-4 h-4 mr-2" />
          {fileName || `Choose ${label}`}
        </label>
        <input
          id={name}
          type="file"
          accept="image/*"
          className="sr-only"
          {...register(name)}
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

// --- Main Component ---

const AddMoviesForm = () => {
  const [posterBase64, setPosterBase64] = useState(null);
  const [backdropBase64, setBackdropBase64] = useState(null);
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });

  const {
    register,
    setValue,
    getValues,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(MovieSchema),
    defaultValues: {
      title: "",
      rating: 0,
      language: "",
      duration: "",
      releaseDate: "",
      votes: "",
      synopsis: "",
      director: "",
      genreString: "",
      castString: "",
      showtimes: [
        { time: "09:00 AM", theater: "Screen A", price: 10.0, filling: "low" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "showtimes",
  });

  const onSubmit = async (data) => {
    setSubmitMessage({ type: "", text: "" });

    if (!posterBase64 || !backdropBase64) {
      setSubmitMessage({
        type: "error",
        text: "Please upload both Poster and Backdrop images.",
      });
      return;
    }

    // 1. Prepare the final payload for the backend API
    const moviesData = {
      ...data,
      // The API you provided expects 'poster' and 'backdrop' fields
      // in moviesData, even if they are overwritten by imageUrls later.
      // We will fill them with a mock value for completeness.
      poster: "uploaded-poster-url",
      backdrop: "uploaded-backdrop-url",
    };

    const images = [posterBase64, backdropBase64]; // Array of base64 strings

    // 2. Mock API call (Replace with your actual 'addMovies' call)
    console.log("--- Submitting Data Payload ---");
    console.log("moviesData:", moviesData);
    console.log(`images: [${images.length} base64 images]`);

    // Example call structure:
    // const result = await addMovies({ moviesData, images });

    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay

    try {
      // Mock success case
      setSubmitMessage({
        type: "success",
        text: "Movie added successfully! (Mock Submission)",
      });
      reset(); // Clear form on success
      setPosterBase64(null);
      setBackdropBase64(null);
    } catch (error) {
      // Mock error case
      setSubmitMessage({
        type: "error",
        text: `Failed to add movie: ${error.message}`,
      });
    }
  };

  const getError = (name) => errors[name]?.message;

  const Input = ({ label, name, type = "text", placeholder = "" }) => (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        type={type}
        {...register(name, { valueAsNumber: type === "number" })}
        placeholder={placeholder}
        className={`mt-1 block w-full rounded-lg border p-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
          getError(name) ? "border-red-500" : "border-gray-300"
        }`}
      />
      {getError(name) && (
        <p className="mt-1 text-xs text-red-500">{getError(name)}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex items-center justify-center font-[Inter]">
      <div className="w-full max-w-4xl bg-white p-6 sm:p-10 rounded-xl shadow-2xl">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-3">
          Add New Movie
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* --- Section 1: Core Movie Details --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Movie Title"
              id="titleString"
              {...register("titleString")}
              name="title"
              placeholder="Dune: Part Two"
            />
            <Input
              label="Director"
              id="directorString"
              {...register("directorString")}
              name="director"
              placeholder="Denis Villeneuve"
            />
            <Input
              label="Rating (0-10)"
              id="ratingString"
              {...register("ratingString")}
              name="rating"
              type="number"
              placeholder="8.6"
            />
            <Input
              label="Votes (String)"
              id="voteString"
              {...register("voteString")}
              name="votes"
              placeholder="10.5k"
            />
            <Input
              label="Language"
              id="languageString"
              {...register("languageString")}
              name="language"
              placeholder="English"
            />
            <Input
              label="Duration"
              id="durationString"
              {...register("durationString")}
              name="duration"
              placeholder="2h 46m"
            />
            <Input
              label="Release Date"
              id="releaseDateString"
              {...register("releaseDateString")}
              name="releaseDate"
              type="date"
            />

            <div>
              <label
                htmlFor="genreString"
                className="block text-sm font-medium text-gray-700"
              >
                Genres (Comma-separated)
              </label>
              <input
                id="genreString"
                {...register("genreString")}
                placeholder="Action, Sci-Fi, Adventure"
                className={`mt-1 block w-full rounded-lg border p-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  getError("genreString") ? "border-red-500" : "border-gray-300"
                }`}
              />
              {getError("genreString") && (
                <p className="mt-1 text-xs text-red-500">
                  {getError("genreString")}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="castString"
                className="block text-sm font-medium text-gray-700"
              >
                Cast (Comma-separated)
              </label>
              <input
                id="castString"
                {...register("castString")}
                placeholder="Timothée Chalamet, Zendaya, Rebecca Ferguson"
                className={`mt-1 block w-full rounded-lg border p-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  getError("castString") ? "border-red-500" : "border-gray-300"
                }`}
              />
              {getError("castString") && (
                <p className="mt-1 text-xs text-red-500">
                  {getError("castString")}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="synopsis"
                className="block text-sm font-medium text-gray-700"
              >
                Synopsis
              </label>
              <textarea
                id="synopsis"
                rows="4"
                {...register("synopsis")}
                placeholder="Describe the movie's plot..."
                className={`mt-1 block w-full rounded-lg border p-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  getError("synopsis") ? "border-red-500" : "border-gray-300"
                }`}
              />
              {getError("synopsis") && (
                <p className="mt-1 text-xs text-red-500">
                  {getError("synopsis")}
                </p>
              )}
            </div>
          </div>

          {/* --- Section 2: Image Uploads --- */}
          <h2 className="text-xl font-bold text-gray-900 pt-4 border-t mt-6">
            Images
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FileInput
              register={register}
              name="posterFile"
              label="Movie Poster"
              setFile={setPosterBase64}
            />
            <FileInput
              register={register}
              name="backdropFile"
              label="Movie Backdrop"
              setFile={setBackdropBase64}
            />
          </div>
          {(!posterBase64 || !backdropBase64) && (
            <p className="text-sm text-yellow-600 mt-2">
              *Poster and Backdrop files are required and will be converted to
              Base64 for the API's `images` array.
            </p>
          )}

          {/* --- Section 3: Showtimes (Dynamic Array) --- */}
          <h2 className="text-xl font-bold text-gray-900 pt-4 border-t mt-6">
            Showtimes
          </h2>
          <p className="text-xs text-red-500 -mt-2">{getError("showtimes")}</p>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col sm:grid sm:grid-cols-5 gap-3 items-end"
              >
                {/* Time */}
                <div className="col-span-1 w-full">
                  <label
                    htmlFor={`showtimes[${index}].time`}
                    className="block text-xs font-medium text-gray-600"
                  >
                    Time
                  </label>
                  <input
                    id={`showtimes[${index}].time`}
                    {...register(`showtimes.${index}.time`)}
                    type="text"
                    placeholder="e.g., 07:00 PM"
                    className={`mt-1 block w-full rounded-lg border p-2 text-sm shadow-sm ${
                      errors.showtimes?.[index]?.time
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.showtimes?.[index]?.time && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.showtimes[index].time.message}
                    </p>
                  )}
                </div>

                {/* Theater */}
                <div className="col-span-1 w-full">
                  <label
                    htmlFor={`showtimes[${index}].theater`}
                    className="block text-xs font-medium text-gray-600"
                  >
                    Theater
                  </label>
                  <input
                    id={`showtimes[${index}].theater`}
                    {...register(`showtimes.${index}.theater`)}
                    type="text"
                    placeholder="e.g., Screen 5"
                    className={`mt-1 block w-full rounded-lg border p-2 text-sm shadow-sm ${
                      errors.showtimes?.[index]?.theater
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.showtimes?.[index]?.theater && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.showtimes[index].theater.message}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className="col-span-1 w-full">
                  <label
                    htmlFor={`showtimes[${index}].price`}
                    className="block text-xs font-medium text-gray-600"
                  >
                    Price ($)
                  </label>
                  <input
                    id={`showtimes[${index}].price`}
                    {...register(`showtimes.${index}.price`, {
                      valueAsNumber: true,
                    })}
                    type="number"
                    step="0.01"
                    placeholder="e.g., 14.50"
                    className={`mt-1 block w-full rounded-lg border p-2 text-sm shadow-sm ${
                      errors.showtimes?.[index]?.price
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.showtimes?.[index]?.price && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.showtimes[index].price.message}
                    </p>
                  )}
                </div>

                {/* Filling */}
                <div className="col-span-1 w-full">
                  <label
                    htmlFor={`showtimes[${index}].filling`}
                    className="block text-xs font-medium text-gray-600"
                  >
                    Filling
                  </label>
                  <input
                    id={`showtimes[${index}].filling`}
                    {...register(`showtimes.${index}.filling`)}
                    type="text"
                    placeholder="e.g., low"
                    className={`mt-1 block w-full rounded-lg border p-2 text-sm shadow-sm ${
                      errors.showtimes?.[index]?.filling
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.showtimes?.[index]?.filling && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.showtimes[index].filling.message}
                    </p>
                  )}
                </div>

                {/* Remove Button */}
                <div className="col-span-1 w-full sm:w-auto">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="w-full sm:w-auto p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-150 flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              append({ time: "", theater: "", price: 0, filling: "" })
            }
            className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition duration-150"
          >
            <Plus className="w-4 h-4" />
            <span>Add Showtime</span>
          </button>

          {/* --- Submission and Status --- */}
          <div className="pt-6 border-t mt-6">
            {submitMessage.text && (
              <div
                className={`p-3 mb-4 rounded-lg text-sm ${
                  submitMessage.type === "success"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {submitMessage.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150"
            >
              {isSubmitting ? "Adding Movie..." : "Add Movie to Database"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMoviesForm;
