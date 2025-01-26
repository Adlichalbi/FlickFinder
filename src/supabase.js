import { createClient } from '@supabase/supabase-js'
const supabaseUrl= import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

const supabase = createClient(supabaseUrl, supabaseKey , {
    global:{
        headers:{
            'Content-Type':'application/json'
        }
    }
})

export const updateSearchCount = async (searchTerm, movie) => {
    try {
      
      const { data: existingEntry, error: fetchError } = await supabase
        .from('movies') 
        .select('*')
        .eq('searchTerm', searchTerm)
        .single()
  
      if (fetchError && fetchError.code !== 'PGRST116') {
       
        throw fetchError
      }
  
     
      if (existingEntry) {
        const { error: updateError } = await supabase
          .from('movies')
          .update({ count: existingEntry.count + 1 })
          .eq('movie_id', existingEntry.movie_id)
  
        if (updateError) throw updateError
      } else {
        
        const { error: insertError } = await supabase
          .from('movies')
          .insert({
            searchTerm,
            count: 1,
            movie_id: movie.id,
            poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          })
  
        if (insertError) throw insertError
      }
    } catch (error) {
      console.error('Error updating search count:', error)
    }
  }
  
  export const getTrendingMovies = async () => {
    try {
   
      const { data: trendingMovies, error } = await supabase
        .from('movies') 
        .select('*')
        .order('count', { ascending: false })
        .limit(5)
  
      if (error) throw error
  
      return trendingMovies
    } catch (error) {
      console.error('Error fetching trending movies:', error)
    }
  }