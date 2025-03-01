import Search from "./components/Search.jsx"
import {useEffect, useState} from "react";
import Spinner from "./components/Spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import {useDebounce} from "react-use";
import {getTrendingMovies, updateSearchCount} from "./appwrite.js";

const API_BASE_URL= 'https://api.themoviedb.org/3'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {

  const [debounceSearchTerm, setDebounceSearchTerm] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const [errorMessage, setErrorMessage] = useState('')
  const [movieList, setMovieList] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const [trendingMovies, setTrendingMovies] = useState([])

  // Debounce - prevent users to make too many request to API
  useDebounce( () =>
    setDebounceSearchTerm(searchTerm),
    1000,
    [searchTerm]
  )

  const fetchMovies = async (query = '') => {

    setIsLoading(true)
    setErrorMessage('')

    try{
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&include_adult=false`
        : `${API_BASE_URL}/discover/movie?include_adult=false&sort_by=popularity.desc`

      const response = await fetch(endpoint, API_OPTIONS)

      if(!response.ok) {
        throw new Error('Something went wrong')
      }

      const data = await response.json()

      if(data.Response === 'False') {
        setErrorMessage(data.Error || 'No movies found. Please try again.')
        setMovieList([])
        return;
      }

      setMovieList(data.results || [])

      if(query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }

    } catch (e) {
      setIsLoading(false)
      console.error(`Error fetching movies: ${e.message}`);
      setErrorMessage('Error fetching movies. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const loadTrendingMovies = async () => {
    try{
      const movies = await getTrendingMovies()

      setTrendingMovies(movies);
    }
    catch (e) {
      console.error(`Error fetching trending movies: ${e.message}`);
    }
  }

  useEffect(() => {
    fetchMovies(debounceSearchTerm).then();
  }, [debounceSearchTerm]);

  useEffect(() => {
    loadTrendingMovies().then();
  }, []);
  
  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <img src="/hero.png" alt="Hero Banner" />
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        { trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map( (movie, index) => (
                // <MovieCard key={movie.$id}  movie={movie} />
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>All Movies</h2>
          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map( (movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
export default App
