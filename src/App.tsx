import { useState, useEffect } from 'react'
import './App.css'


interface Comment {
  id: number;
  name: string;
  email: string;
  body: string;
}

function App() {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [results, setResults] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const searchComments = async (term: string) => {
    if (term.length <= 3) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/comments?q=${encodeURIComponent(term)}`
      )
      const data = await response.json()
      setResults(data.slice(0, 20))
    } catch (err) {
      setResults([])
      console.error('Failed to fetch results:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // debounce search

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchComments(searchTerm)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    searchComments(searchTerm)
  }

  return (
    <div className="container">
      <h1>Comment Search</h1>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Search comments (more than 3 characters)"
        />
        <button type="submit" disabled={isLoading}>
            Search
        </button>
      </form>

      <div className="results">
        {isLoading && <div className="loading">Loading...</div>}
        {!isLoading && results.length === 0 && searchTerm.length > 3 && (
          <div className="no-results">No results found</div>
        )}
        {!isLoading && results.length>0 && <div className="results-scroll">
          {results.map(comment => (
            <div key={comment.id} className="result-item">
              <h3>{comment.name}</h3>
              <p>{comment.email}</p>
              <p>{comment.body.substring(0, 64)}{comment.body.length > 64 ? '...' : ''}</p>
            </div>
          ))}
        </div>}
      </div>
    </div>
  )
}

export default App