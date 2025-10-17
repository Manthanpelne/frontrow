"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, Upload, Loader2 } from "lucide-react";
import z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useFetch from "@/hooks/use-fetch";
import { addMovies } from "@/actions/movies";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Define seat types array
const seatTypes = ["VIP", "Standard", "Premium"];

// --- Zod Schema Definition ---

const SeatPriceSchema = z.object({
  seatType: z
    .string()
    .min(1, { message: "Seat Type is required (eg., VIP, Standard)." }),
  price: z.coerce
    .number()
    .int({ message: "Price must be a whole number (integer)." })
    .min(1, { message: "Price must be greater than 0." }),
});

// Schema for a single Showtime entry
// NOTE: Removed 'price' field as it's now handled by the 'seatPrices' array
const ShowtimeSchema = z.object({
  time: z.string().min(1, { message: "Time is required." }),
  theater: z.string().min(1, { message: "Theater is required." }),
  seatPrices: z
    .array(SeatPriceSchema)
    .min(1, { message: "At least one Seat Price is required." }),
  filling: z
    .string()
    .min(1, { message: "Filling is required (e.g., Slow, Medium, Fast)." }),
});

// Schema for the entire Movie payload
const MovieSchema = z.object({
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

    // Transform comma-separated string to an array of trimmed strings
    genreString: z
      .string()
      .min(1, { message: "At least one genre is required (comma-separated)." }),
    castString: z.string().min(1, {
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
    genreString: "",
    castString: "",
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

// --- New Nested Component: ShowtimeFieldArray ---

const ShowtimeFieldArray = ({
  field, // The current showtime field object from the parent array
  index, // The index of the current showtime in the parent array
  control,
  register,
  remove, // Function to remove this entire showtime
  errors, // The top-level errors object
  setValue, // MUST be passed down for controlled components like Select
}) => {
  const {
    fields: priceFields,
    append: appendPrice,
    remove: removePrice,
  } = useFieldArray({
    control,
    name: `showtimes.${index}.seatPrices`, // Nested field array name
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

      {/* Main Showtime Inputs (Time, Theater, Filling) */}
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
            className="flex gap-3 items-center p-2 bg-white border border-dashed rounded-md"
          >
      
            {/* Seat Type */}
           <div className="flex-1 gap-2 space-y-2">
            <label  className="block text-xs font-medium text-gray-500" htmlFor={`showtimes.${index}.seatPrices.${priceIndex}.seatType`}>
              Seat Type
            </label>
            <Select
              // 1. Use setValue for the select component
              onValueChange={(value) =>
                setValue(`showtimes.${index}.seatPrices.${priceIndex}.seatType`, value, { shouldValidate: true })
              }
              // 2. Use the 'priceField' object value for the default value
              defaultValue={priceField.seatType} 
            
            >
              <SelectTrigger
                className={getSeatPriceError(priceIndex, "seatType") ? "border-red-500 w-[200px]" : "w-[200px]"}
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
                step="1" // Enforce integer input as per Zod schema
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
                className="p-2 bg-red-400 text-white rounded-md hover:bg-red-500 transition duration-150"
              >
                <X className="w-3 h-3" />
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

// --- Main Component ---

const AddMoviesForm = () => {
  const [posterBase64, setPosterBase64] = useState(null);
  const [backdropBase64, setBackdropBase64] = useState(null);
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });

  const router = useRouter()

  const {
    register,
    handleSubmit,
    control,
    setValue, 
    formState: { errors, isSubmitting },
    reset
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
        {
          time: "09:00 AM",
          theater: "Screen A",
          filling: "Slow",
          seatPrices: [{ seatType: "Standard", price: 150 }], // Initial nested value
        },
      ],
    },
  });

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



const {data: addMoviesResult, loading:addmoviesLoading, fn:addMoviefn} = useFetch(addMovies)


useEffect(()=>{
   if(addMoviesResult?.success){
     toast.success(`${addMoviesResult.message}`)
     router.push("/admin/movies")
   }
},[addMoviesResult,addmoviesLoading])


//api handler
 const onSubmit = async (data) => {
    setSubmitMessage({ type: "", text: "" });

    if (!posterBase64 || !backdropBase64) {
      setSubmitMessage({
        type: "error",
        text: "Please upload both Poster and Backdrop images.",
      });
      return;
    }
    console.log("data",data)
    const moviesData = {
      ...data
    }
    await addMoviefn({
      moviesData,
      images :  [posterBase64, backdropBase64]
    })
  };


  

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

          {/* --- Section 3: Showtimes (Dynamic Array with Nested Dynamic Array) --- */}
          <h2 className="text-xl font-bold text-gray-900 pt-4 border-t mt-6">
            Showtimes
          </h2>
          <p className="text-xs text-red-500 -mt-2">{getError("showtimes")}</p>

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
                getError={getError}
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
                seatPrices: [{ seatType: "", price: 0 }], // New showtime gets one default seat price
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
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150"
            >
              {isSubmitting && addmoviesLoading ?
               <>
                <Loader2 className="animate-spin mr-2 h-4 w-4"/>
                Adding movie...
              </> : "Add Movie to Database"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMoviesForm;
