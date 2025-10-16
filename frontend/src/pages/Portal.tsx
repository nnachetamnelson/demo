import { useEffect, useState } from 'react'
 import { api } from '../lib/api';

type LinkItem = { id: number; parentId: number; studentId: number }

export default function Portal() {
  const [items, setItems] = useState<LinkItem[]>([])
  const [error, setError] = useState<string | null>(null)



  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/portal/parent-students')
        const data = Array.isArray(res.data?.data) ? res.data.data : []
        setItems(data)
      } catch (err: any) {
        setError(err.response?.data?.message || err.message)
      }
    })()
  }, [])

  return (
    <div className="p-6 font-sans">
      <h2 className="text-xl font-semibold mb-3">Parent-Student Links</h2>
      {error && <p className="text-red-600">{error}</p>}
      <ul className="space-y-2">
        {items.map(i => (
          <li key={i.id} className="border rounded px-3 py-2 bg-white">Parent #{i.parentId} ↔ Student #{i.studentId}</li>
        ))}
      </ul>
    </div>
  )
}


