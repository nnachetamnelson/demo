import { useEffect, useState } from 'react'
 import { api } from '../lib/api';

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, TextField, Typography, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert } from '@mui/material'

type Exam = { id: number; name: string; date: string; maxScore?: number; semester?: string; academicYear?: string; classId?: number; subjectId?: number }

export default function Exams() {
  const [items, setItems] = useState<Exam[]>([])
  const [error, setError] = useState<string | null>(null)
  // Create form
  const [classId, setClassId] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [maxScore, setMaxScore] = useState('')
  const [semester, setSemester] = useState('')
  const [academicYear, setAcademicYear] = useState('')
  // Edit/Delete
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [activeId, setActiveId] = useState<number | null>(null)
  const [eName, setEName] = useState('')
  const [eDate, setEDate] = useState('')
  const [eMax, setEMax] = useState('')
  const [eSem, setESem] = useState('')
  const [eYear, setEYear] = useState('')
  const [classOpts, setClassOpts] = useState<any[]>([])
  const [subjectOpts, setSubjectOpts] = useState<any[]>([])
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: 'success' | 'error' }>({ open: false, msg: '', sev: 'success' })
 
 
  const load = async () => {
    const res = await api.get('/api/exams/exams')
    const data = Array.isArray(res.data) ? res.data : res.data.data || []
    setItems(data)
  }

  useEffect(() => {
    (async () => {
      try {
        await load()
        const [cRes, sRes] = await Promise.all([
          api.get('/api/classroom/classes'),
          api.get('/api/classroom/subjects'),
        ])
        const cData = Array.isArray(cRes.data) ? cRes.data : cRes.data.data || []
        const sData = Array.isArray(sRes.data) ? sRes.data : sRes.data.data || []
        setClassOpts(cData)
        setSubjectOpts(sData)
      } catch (err: any) {
        setError(err.response?.data?.message || err.message)
      }
    })()
  }, [])

  const createExam = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/api/exams/exams', {
        classId: Number(classId),
        subjectId: Number(subjectId),
        name,
        date,
        maxScore: Number(maxScore),
        semester,
        academicYear,
      })
      setClassId(''); setSubjectId(''); setName(''); setDate(''); setMaxScore(''); setSemester(''); setAcademicYear('')
      await load()
      setError(null)
      setSnack({ open: true, msg: 'Exam created', sev: 'success' })
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
      setSnack({ open: true, msg: err.response?.data?.message || err.message, sev: 'error' })
    }
  }

  const openEdit = (ex: Exam) => {
    setActiveId(ex.id)
    setEName((ex as any).name || '')
    setEDate((ex as any).date || '')
    setEMax(String((ex as any).maxScore ?? ''))
    setESem((ex as any).semester || '')
    setEYear((ex as any).academicYear || '')
    setEditOpen(true)
  }

  const saveEdit = async () => {
    if (!activeId) return
    try {
      await api.put(`/api/exams/exams/${activeId}`, {
        name: eName || undefined,
        date: eDate || undefined,
        maxScore: eMax ? Number(eMax) : undefined,
        semester: eSem || undefined,
        academicYear: eYear || undefined,
      })
      setEditOpen(false)
      await load()
      setError(null)
      setSnack({ open: true, msg: 'Exam updated', sev: 'success' })
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
      await api.delete(`/api/exams/exams/${activeId}`)
      setDeleteOpen(false)
      await load()
      setSnack({ open: true, msg: 'Exam deleted', sev: 'success' })
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
      setSnack({ open: true, msg: err.response?.data?.message || err.message, sev: 'error' })
    }
  }

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>Exams</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box component="form" onSubmit={createExam}>
          <Stack spacing={2} direction={{ xs: 'column', md: 'row' }}>
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel id="class-label">Class</InputLabel>
              <Select labelId="class-label" label="Class" value={classId} onChange={(e) => setClassId(e.target.value as string)} required>
                {classOpts.map((c: any) => (
                  <MenuItem key={c.id} value={String(c.id)}>{c.level} - {c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel id="subject-label">Subject</InputLabel>
              <Select labelId="subject-label" label="Subject" value={subjectId} onChange={(e) => setSubjectId(e.target.value as string)} required>
                {subjectOpts.map((s: any) => (
                  <MenuItem key={s.id} value={String(s.id)}>{s.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <TextField label="Date" type="date" InputLabelProps={{ shrink: true }} value={date} onChange={(e) => setDate(e.target.value)} required />
            <TextField label="Max Score" value={maxScore} onChange={(e) => setMaxScore(e.target.value)} required />
            <TextField label="Semester" value={semester} onChange={(e) => setSemester(e.target.value)} />
            <TextField label="Academic Year" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} />
            <Button type="submit" variant="contained">Add</Button>
          </Stack>
        </Box>
      </Paper>

      <Stack spacing={1}>
        {items.map(e => (
          <Paper key={e.id} sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{(e as any).name} - {(e as any).date}</span>
            <span>
              <Button size="small" sx={{ mr: 1 }} onClick={() => openEdit(e)}>Edit</Button>
              <Button size="small" color="error" onClick={() => openDelete(e.id)}>Delete</Button>
            </span>
          </Paper>
        ))}
      </Stack>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Exam</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={eName} onChange={(ev) => setEName(ev.target.value)} />
            <TextField label="Date" type="date" InputLabelProps={{ shrink: true }} value={eDate} onChange={(ev) => setEDate(ev.target.value)} />
            <TextField label="Max Score" value={eMax} onChange={(ev) => setEMax(ev.target.value)} />
            <TextField label="Semester" value={eSem} onChange={(ev) => setESem(ev.target.value)} />
            <TextField label="Academic Year" value={eYear} onChange={(ev) => setEYear(ev.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveEdit}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete Exam?</DialogTitle>
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


