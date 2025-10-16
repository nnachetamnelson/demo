import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Dashboard() {
  const { setToken } = useAuth()
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Dashboard</h2>
      <nav style={{ display: 'flex', gap: 12 }}>
        <Link to="/students">Students</Link>
        <button onClick={() => setToken(null)}>Logout</button>
      </nav>
    </div>
  )
}


