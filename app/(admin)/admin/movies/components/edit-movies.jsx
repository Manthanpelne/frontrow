"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useFetch from "@/hooks/use-fetch";
// import { getMovieById } from "@/actions/movies"; // REMOVE: No longer needed!
import { editMovies } from "@/actions/movies"; // KEEP: Still needed for submission
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Define seat types array
const seatTypes = ["VIP", "Standard", "Premium"];

// --- Zod Schema Definitions (Remain the same) ---
const SeatPriceSchema = z.object({
  id: z.coerce.string().optional(),
  seatType: z
    .string()
    .min(1, { message: "Seat Type is required (eg., VIP, Standard)." }),
  price: z.coerce
    .number()
    .int({ message: "Price must be a whole number (integer)." })
    .min(1, { message: "Price must be greater than 0." }),
});

const ShowtimeSchema = z.object({
  id: z.coerce.string().optional(),
  time: z.string().min(1, { message: "Time is required." }),
  theater: z.string().min(1, { message: "Theater is required." }),
  seatPrices: z
    .array(SeatPriceSchema)
    .min(1, { message: "At least one Seat Price is required." }),
  filling: z
    .string()
    .min(1, { message: "Filling is required (e.g., Slow, Medium, Fast)." }),
});

const MovieSchema = z.object({
  id: z.string().min(1, { message: "Movie ID is required for editing." }),
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
  releaseDate: z.string().min(8, { message: "Valid date required" }),
  votes: z.string().min(1, { message: "Votes count is required." }),
  synopsis: z.string().min(10, { message: "Synopsis must be detailed." }),
  director: z.string().min(3, { message: "Director name is required." }),
  genreString: z
    .string()
    .min(1, { message: "At least one genre is required (comma-separated)." }),
  castString: z.string().min(1, {
    message: "At least one cast member is required (comma-separated).",
  }),
  showtimes: z
    .array(ShowtimeSchema)
    .min(1, { message: "At least one showtime is required." }),
  posterFile: z.any(),
  backdropFile: z.any(),
})
  .transform((data) => ({
    ...data,
    genre: data.genreString
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0),
    cast: data.castString
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0),
  }));

// --- FileInput Component (Remains the same) ---
// ... (FileInput component code from previous response) ...
const FileInput = ({ register, name, label, setFile, initialUrl }) => {
    const [fileName, setFileName] = useState(initialUrl ? "Existing Image" : "");
    const [previewUrl, setPreviewUrl] = useState(initialUrl || "");
  
    const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if (!file) {
        setFileName(initialUrl ? "Existing Image" : "");
        setPreviewUrl(initialUrl || "");
        setFile(initialUrl || null);
        return;
      }
  
      setFileName(file.name);
  
      const toBase64 = (f) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(f);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
  
      try {
        const base64Data = await toBase64(file);
        setFile(base64Data);
        setPreviewUrl(URL.createObjectURL(file));
      } catch (error) {
        console.error("Error converting file to base64:", error);
        setFile(initialUrl || null);
        setFileName(initialUrl ? "Existing Image" : "");
        setPreviewUrl(initialUrl || "");
      }
    };
  
    useEffect(() => {
      if (initialUrl) {
        setFile(initialUrl);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialUrl]);
  
    return (
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center space-x-2">
          <label
            htmlFor={name}
            className="grow flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer transition duration-150 ease-in-out"
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
        {previewUrl && (
          <div className="mt-2 w-20 h-20 border rounded-lg overflow-hidden flex items-center justify-center">
            <img src={previewUrl} alt="Preview" className="object-cover w-full h-full" />
          </div>
        )}
        {!previewUrl && (
          <div className="mt-2 w-20 h-20 border border-dashed rounded-lg flex items-center justify-center text-gray-400">
            <ImageIcon className="w-6 h-6" />
          </div>
        )}
      </div>
    );
  };

// --- ShowtimeFieldArray Component (Remains the same) ---
// ... (ShowtimeFieldArray component code from previous response) ...
const ShowtimeFieldArray = ({
    field,
    index,
    control,
    register,
    remove,
    errors,
    setValue,
  }) => {
    const {
      fields: priceFields,
      append: appendPrice,
      remove: removePrice,
    } = useFieldArray({
      control,
      name: `showtimes.${index}.seatPrices`,
    });
  
    const getSeatPriceError = (priceIndex, fieldName) =>
      errors.showtimes?.[index]?.seatPrices?.[priceIndex]?.[fieldName]?.message;
  
    return (
      <div
        key={field.id}
        className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4"
      >
        <div className="flex justify-between items-center border-b pb-2 mb-2">
          <h3 className="text-md font-semibold text-gray-800">
            Showtime #{index + 1}
          </h3>
          {index > 0 && (
            <button
              type="button"
              onClick={() => remove(index)}
              className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-150"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
  
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Time */}
          <div className="w-full">
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
          <div className="w-full">
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
  
          {/* Filling */}
          <div className="w-full">
            <label
              htmlFor={`showtimes[${index}].filling`}
              className="block text-xs font-medium text-gray-600"
            >
              Filling (e.g., Low, Medium)
            </label>
            <input
              id={`showtimes[${index}].filling`}
              {...register(`showtimes.${index}.filling`)}
              type="text"
              placeholder="e.g., Medium"
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
        </div>
  
        {/* Seat Prices Sub-Array */}
        <h4 className="text-sm font-medium text-gray-700 pt-2 border-t mt-3">
          Seat Prices & Types
        </h4>
        <p className="text-xs text-red-500 -mt-2">
          {errors.showtimes?.[index]?.seatPrices?.message}
        </p>
        <div className="space-y-3">
          {priceFields.map((priceField, priceIndex) => (
            <div
              key={priceField.id}
              className="flex flex-col sm:flex-row gap-1 sm:gap-3 items-center p-2 bg-white border border-dashed rounded-md"
            >
              {/* Seat Type */}
              <div className="flex-1 gap-2 space-y-2">
                <label
                  className="block text-xs font-medium text-gray-500"
                  htmlFor={`showtimes.${index}.seatPrices.${priceIndex}.seatType`}
                >
                  Seat Type
                </label>
                <Select
                  onValueChange={(value) =>
                    setValue(
                      `showtimes.${index}.seatPrices.${priceIndex}.seatType`,
                      value,
                      { shouldValidate: true }
                    )
                  }
                  defaultValue={priceField.seatType}
                >
                  <SelectTrigger
                    className={
                      getSeatPriceError(priceIndex, "seatType")
                        ? "border-red-500 w-[200px]"
                        : "w-[200px]"
                    }
                  >
                    <SelectValue placeholder="Select seat type" />
                  </SelectTrigger>
                  <SelectContent>
                    {seatTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getSeatPriceError(priceIndex, "seatType") && (
                  <p className="text-xs text-red-500 mt-1">
                    {getSeatPriceError(priceIndex, "seatType")}
                  </p>
                )}
              </div>
  
              {/* Price */}
              <div className="flex-1">
                <label
                  htmlFor={`showtimes.${index}.seatPrices.${priceIndex}.price`}
                  className="block text-xs font-medium text-gray-500"
                >
                  Price
                </label>
                <input
                  id={`showtimes.${index}.seatPrices.${priceIndex}.price`}
                  {...register(
                    `showtimes.${index}.seatPrices.${priceIndex}.price`,
                    {
                      valueAsNumber: true,
                    }
                  )}
                  type="number"
                  step="1"
                  placeholder="250"
                  className={`mt-1 block w-full rounded-lg border p-2 text-sm shadow-sm ${
                    getSeatPriceError(priceIndex, "price")
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {getSeatPriceError(priceIndex, "price") && (
                  <p className="text-xs text-red-500 mt-1">
                    {getSeatPriceError(priceIndex, "price")}
                  </p>
                )}
              </div>
  
              {/* Remove Seat Price Button */}
              <div className="pt-5">
                <button
                  type="button"
                  onClick={() => removePrice(priceIndex)}
                  className="p-2 bg-red-400 flex items-center gap-1 text-xs text-white rounded-md hover:bg-red-500 transition duration-150"
                >
                  Remove
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
  
          <button
            type="button"
            onClick={() => appendPrice({ seatType: "", price: 0 })}
            className="flex items-center space-x-1 px-3 py-1 text-xs font-medium text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition duration-150 w-fit"
          >
            <Plus className="w-3 h-3" />
            <span>Add Seat Price</span>
          </button>
        </div>
      </div>
    );
  };


// --- Main Edit Component (Modified) ---

const EditMoviesForm = ({ movie }) => { // 💡 Change: Accept 'movie' prop
  const [posterBase64OrUrl, setPosterBase64OrUrl] = useState(null);
  const [backdropBase64OrUrl, setBackdropBase64OrUrl] = useState(null);
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });

  const router = useRouter();
  
  // 💡 REMOVED: Fetching hook for getMovieById is gone!
  // const { data: movieData, loading: movieLoading, fn: fetchMovieFn } = useFetch(getMovieById); 

  // Data pre-processing for useForm defaultValues
  const formattedReleaseDate = new Date(movie.releaseDate).toISOString().split('T')[0];
  
  const defaultValues = {
    id: movie.id,
    title: movie.title,
    rating: movie.rating,
    language: movie.language,
    duration: movie.duration,
    releaseDate: formattedReleaseDate,
    votes: movie.votes,
    synopsis: movie.synopsis,
    director: movie.director,
    genreString: movie.genre.join(", "),
    castString: movie.cast.join(", "),
    // Format showtimes and ensure prices are numbers
    showtimes: movie.showtimes.map(st => ({
        ...st,
        seatPrices: st.seatPrices.map(sp => ({
            ...sp,
            price: parseFloat(sp.price), 
        }))
    })),
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(MovieSchema),
    // 💡 Change: Use pre-processed 'defaultValues' directly
    defaultValues: defaultValues,
  });

  // 💡 Change: Initialize image states using props once the component mounts
  useEffect(() => {
    setPosterBase64OrUrl(movie.poster);
    setBackdropBase64OrUrl(movie.backdrop);
    // You could call reset(defaultValues) here if preferred, but using
    // defaultValues in useForm is more direct for initial load.
  }, [movie]); 

  const { fields, append, remove } = useFieldArray({
    control,
    name: "showtimes",
  });

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

  // Submission Logic (Remains the same, uses editMovies)
  const {
    data: editMoviesResult,
    loading: editMoviesLoading,
    fn: editMovieFn,
  } = useFetch(editMovies);

  useEffect(() => {
    if (editMoviesResult?.success) {
      toast.success(`${editMoviesResult.message}`);
      router.push("/admin/movies");
    } else if (editMoviesResult?.message && !editMoviesResult.success) {
        toast.error(`${editMoviesResult.message}`);
    }
  }, [editMoviesResult, editMoviesLoading, router]);

  const onSubmit = async (data) => {
    setSubmitMessage({ type: "", text: "" });

    if (!posterBase64OrUrl || !backdropBase64OrUrl) {
      setSubmitMessage({
        type: "error",
        text: "Poster and Backdrop images are required. Please upload or ensure existing images are set.",
      });
      return;
    }
    
    const moviesData = {
        ...data,
        posterFile: undefined, 
        backdropFile: undefined, 
    };

    await editMovieFn({
      moviesData,
      images: [posterBase64OrUrl, backdropBase64OrUrl], 
    });
  };
  
  // 💡 Change: No initial loading state needed here, as data is provided via props.
  // We can add a fallback if the movie prop is somehow null, though the server component already handles it.
  if (!movie) {
    return <div className="p-8 text-center opacity-40">Error: Movie data is missing.</div>;
  }

  return (
    <div className="min-h-screen rounded-xl bg-[#f7f7f6] p-4 sm:p-8 flex items-center justify-center font-[Inter]">
      <div className="w-full max-w-4xl bg-white p-6 sm:p-10 rounded-xl shadow-2xl">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-3">
          Edit Movie: {movie.title}
        </h1>
        <input type="hidden" {...register("id")} /> 

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ... (Rest of the form structure remains the same) ... */}
            {/* --- Section 1: Core Movie Details --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Movie Title"
              name="title"
              placeholder="Dune: Part Two"
            />
            <Input
              label="Director"
              name="director"
              placeholder="Denis Villeneuve"
            />
            <Input
              label="Rating (0-10)"
              name="rating"
              type="number"
              placeholder="8.6"
            />
            <Input label="Votes (String)" name="votes" placeholder="10.5k" />
            <Input label="Language" name="language" placeholder="English" />
            <Input label="Duration" name="duration" placeholder="2h 46m" />
            <Input label="Release Date" name="releaseDate" type="date" /> 

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
              setFile={setPosterBase64OrUrl}
              initialUrl={movie.poster} // Using movie prop directly
            />
            <FileInput
              register={register}
              name="backdropFile"
              label="Movie Backdrop"
              setFile={setBackdropBase64OrUrl}
              initialUrl={movie.backdrop} // Using movie prop directly
            />
          </div>
          {(!posterBase64OrUrl || !backdropBase64OrUrl) && (
            <p className="text-sm text-yellow-600 mt-2">
              *The image fields below show existing URLs. Selecting a new file will replace the existing image.
            </p>
          )}

          {/* --- Section 3: Showtimes (Dynamic Array with Nested Dynamic Array) --- */}
          <h2 className="text-xl font-bold text-gray-900 pt-4 border-t mt-6">
            Showtimes
          </h2>
          <p className="text-xs text-red-500 -mt-2">{errors.showtimes?.message}</p>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <ShowtimeFieldArray
                key={field.id}
                field={field}
                index={index}
                control={control}
                register={register}
                remove={remove}
                errors={errors}
                setValue={setValue}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              append({
                time: "",
                theater: "",
                filling: "",
                seatPrices: [{ seatType: "", price: 0 }],
              })
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
              disabled={isSubmitting || editMoviesLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150"
            >
              {(isSubmitting || editMoviesLoading) ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Updating movie...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMoviesForm;