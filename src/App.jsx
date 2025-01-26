import React, { useState , useEffect } from 'react'
import { useDebounce } from 'react-use'
import Search from './components/Search'
import Spinner from './components/Spinner'
import MovieCard from './components/MovieCard'
import { getTrendingMovies, updateSearchCount } from './supabase.js'

const API_BASE_URL = "https://api.themoviedb.org/3"
const API_KEY = import.meta.env.VITE_TMDB_API_KEY



const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}
const App = () => {

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  
  const [movies, setMovies] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [trendingMovies, setTrendingMovies] = useState([])


  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

  const fetchMovies = async(query ='') => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const endpoint = query ? 
      `${API_BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}&query=${searchTerm}`
      const response = await fetch(endpoint, API_OPTIONS)
      
      if(!response.ok){
        throw new Error('Failed to fetch movies')
      }

      const data = await response.json()
      if(data.Response === 'False'){
        setErrorMessage(data.Error || 'Error fetching movies')
        setMovies([])
        return;
      }

      setMovies(data.results || [])
      if(query && data.results.length > 0){
        await updateSearchCount(query, data.results[0])
      } 

    } catch (error) {
      console.error(`Error fetching movies: ${error}`)
      setErrorMessage('Error fetching movies')
    } finally {
      setIsLoading(false)
    }
  }

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies()
      setTrendingMovies(movies)
      
    } catch (error) {
      console.error(`Error isLoading trending movies: ${error}`)
      
    }
  }


  useEffect(() => {
    fetchMovies(debouncedSearchTerm)
  },[debouncedSearchTerm])

  useEffect(() => {
    loadTrendingMovies()
  },[])

  return (
   <main>
    <div className='pattern'/>

    <div className='wrapper'>

      <header>

        <img src='./hero.png' alt='Hero Banner'></img>
        <h1>Find <span className='text-gradient'>Movies</span> You'll Love
         Without the hassle</h1>
         <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
      </header>
    {trendingMovies.length > 0 && ( 
      <section className='trending'>
        <h2>Trending Movies</h2>
        <ul>
          {trendingMovies.map((movie,index) => (
            <li key={movie.movie_id}>
              <p>{index + 1}</p>
              <img src={movie.poster_url}/>
            </li>
          ))}
        </ul>
      </section>
    ) }
    <section className='all-movies'>

      <h2>All Movies</h2>

    {isLoading ? (
        <Spinner/>
      ) : errorMessage ? (
         <p className='text-red-500'>{errorMessage} </p>
         ) : (
          <ul>
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie}/>
            ))}
          </ul>
         ) }

    </section>

    </div>
   </main>
  )
}

export default App