import { useEffect, useState } from 'react'
 import { api } from '../lib/api';

export default function Profiles() {
  const [userId, setUserId] = useState('')
  const [profile, setProfile] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/api/profiles/${userId}`)
      setProfile(res.data?.data || res.data)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
    }
  }

  return (
    <div className="p-6 font-sans">
      <h2 className="text-xl font-semibold mb-3">Profiles</h2>
      <div className="flex gap-2 mb-3">
        <input className="border rounded px-3 py-2" placeholder="User ID" value={userId} onChange={e => setUserId(e.target.value)} />
        <button className="px-3 py-2 rounded bg-gray-900 text-white disabled:opacity-50" onClick={fetchProfile} disabled={!userId}>Fetch</button>
      </div>
      {error && <p className="text-red-600">{error}</p>}
      {profile && <pre className="bg-white border rounded p-3 overflow-auto">{JSON.stringify(profile, null, 2)}</pre>}
    </div>
  )
}


