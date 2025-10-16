import { useEffect, useState } from 'react'
 import { api } from '../lib/api';

import { Box, Button, Paper, Stack, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material'

type Student = {
  id: number
  firstName: string
  lastName: string
}

export default function Students() {
  const [students, setStudents] = useState<Student[]>([])
  const [error, setError] = useState<string | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [classId, setClassId] = useState('')
  const [classOpts, setClassOpts] = useState<any[]>([])
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [activeId, setActiveId] = useState<number | null>(null)
  const [editFirst, setEditFirst] = useState('')
  const [editLast, setEditLast] = useState('')
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: 'success' | 'error' }>({ open: false, msg: '', sev: 'success' })
 
  useEffect(() => {
    (async () => {
      try {
        const [sRes, cRes] = await Promise.all([
          api.get('/api/students'),
          api.get('/api/classroom/classes'),
        ])
        const sData = Array.isArray(sRes.data) ? sRes.data : sRes.data.data || []
        const cData = Array.isArray(cRes.data) ? cRes.data : cRes.data.data || []
        setStudents(sData)
        setClassOpts(cData)
      } catch (err: any) {
        setError(err.response?.data?.message || err.message)
      }
    })()
  }, [])

  const createStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/api/students', { firstName, lastName, classId: classId ? Number(classId) : undefined })
      setFirstName(''); setLastName(''); setClassId('')
      const res = await api.get('/api/students')
      const data = Array.isArray(res.data) ? res.data : res.data.data || []
      setStudents(data)
      setError(null)
      setSnack({ open: true, msg: 'Student created', sev: 'success' })
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
      setSnack({ open: true, msg: err.response?.data?.message || err.message, sev: 'error' })
    }
  }

  const openEdit = (s: Student) => {
    setActiveId(s.id)
    setEditFirst((s as any).firstName)
    setEditLast((s as any).lastName)
    setEditOpen(true)
  }

  const saveEdit = async () => {
    if (!activeId) return
    try {
      await api.put(`/api/students/${activeId}`, { firstName: editFirst, lastName: editLast })
      setEditOpen(false)
      const res = await api.get('/api/students')
      const data = Array.isArray(res.data) ? res.data : res.data.data || []
      setStudents(data)
      setError(null)
      setSnack({ open: true, msg: 'Student updated', sev: 'success' })
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
      setSnack({ open: true, msg: err.response?.data?.message || err.message, sev: 'error' })
    }
  }

  const openDelete = (id: number) => {
    setActiveId(id)
    setDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!activeId) return
    try {
      await api.delete(`/api/students/${activeId}`)
      setDeleteOpen(false)
      const res = await api.get('/api/students')
      const data = Array.isArray(res.data) ? res.data : res.data.data || []
      setStudents(data)
      setError(null)
      setSnack({ open: true, msg: 'Student deleted', sev: 'success' })
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
      setSnack({ open: true, msg: err.response?.data?.message || err.message, sev: 'error' })
    }
  }

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>Students</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box component="form" onSubmit={createStudent}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            <TextField label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel id="class-label">Class (optional)</InputLabel>
              <Select labelId="class-label" label="Class (optional)" value={classId} onChange={(e) => setClassId(e.target.value as string)}>
                <MenuItem value="">None</MenuItem>
                {classOpts.map((c: any) => (
                  <MenuItem key={c.id} value={String(c.id)}>{c.level} - {c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button type="submit" variant="contained">Add</Button>
          </Stack>
        </Box>
      </Paper>
      <Stack spacing={1}>
        {students.map(s => (
          <Paper key={s.id} sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{(s as any).firstName} {(s as any).lastName}</span>
            <span>
              <Button size="small" sx={{ mr: 1 }} onClick={() => openEdit(s)}>Edit</Button>
              <Button size="small" color="error" onClick={() => openDelete(s.id)}>Delete</Button>
            </span>
          </Paper>
        ))}
      </Stack>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Student</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="First name" value={editFirst} onChange={(e) => setEditFirst(e.target.value)} />
            <TextField label="Last name" value={editLast} onChange={(e) => setEditLast(e.target.value)} />
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel id="edit-status">Status</InputLabel>
              <Select labelId="edit-status" label="Status" defaultValue="active" onChange={(e) => {/* optional status change via separate call */}}>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="graduated">Graduated</MenuItem>
                <MenuItem value="deactivated">Deactivated</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveEdit}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete Student?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert onClose={() => setSnack(s => ({ ...s, open: false }))} severity={snack.sev} sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}


