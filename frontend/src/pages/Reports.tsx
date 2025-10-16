import { useEffect, useState } from 'react'
 import { api } from '../lib/api';


export default function Reports() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/reports/report-card')
        setData(res.data)
      } catch (err: any) {
        setError(err.response?.data?.message || err.message)
      }
    })()
  }, [])

  return (
    <div className="p-6 font-sans">
      <h2 className="text-xl font-semibold mb-3">Reports</h2>
      {error && <p className="text-red-600">{error}</p>}
      <pre className="bg-white border rounded p-3 overflow-auto">{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}


