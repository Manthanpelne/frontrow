import MoviesList from "./components/movies-list"


export const metadata = {
    title: "Movies | FrontRow Admin",
    description: "Manage movies in your admin panel"
}
const MoviesPage = ()=>{
 return (
    <div className="p-6">
        <MoviesList/>
    </div>
 )
}

export default MoviesPage