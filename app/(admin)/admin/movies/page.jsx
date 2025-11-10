import MoviesList from "./components/movies-list"


export const metadata = {
    title: "Movies | FrontRow Admin",
    description: "Manage movies in your admin panel"
}
const MoviesPage = ()=>{
 return (
    <div className="px-4 md:px-12">
        <MoviesList/>
    </div>
 )
}

export default MoviesPage