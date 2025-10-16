import { useEffect, useState } from 'react'
 import { api } from '../lib/api';
 
import { Box, Button, Paper, Stack, TextField, Typography, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert } from '@mui/material'

type Attendance = { id: number; date: string; status: string; studentId: number }

export default function Attendance() {
  const [items, setItems] = useState<Attendance[]>([])
  const [error, setError] = useState<string | null>(null)
  const [studentId, setStudentId] = useState('')
  const [classId, setClassId] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [date, setDate] = useState('')
  const [status, setStatus] = useState('present')
  const [studentOpts, setStudentOpts] = useState<any[]>([])
  const [classOpts, setClassOpts] = useState<any[]>([])
  const [subjectOpts, setSubjectOpts] = useState<any[]>([])
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: 'success' | 'error' }>({ open: false, msg: '', sev: 'success' })

  const load = async () => {
    const res = await api.get('/api/attendance')
    const data = Array.isArray(res.data) ? res.data : res.data.data || []
    setItems(data)
  }

  useEffect(() => {
    (async () => {
      try {
        await load()
        // Load options for selects
        const [sRes, cRes, subRes] = await Promise.all([
          api.get('/api/students'),
          api.get('/api/classroom/classes'),
          api.get('/api/classroom/subjects'),
        ])
        const sData = Array.isArray(sRes.data) ? sRes.data : sRes.data.data || []
        const cData = Array.isArray(cRes.data) ? cRes.data : cRes.data.data || []
        const subData = Array.isArray(subRes.data) ? subRes.data : subRes.data.data || []
        setStudentOpts(sData)
        setClassOpts(cData)
        setSubjectOpts(subData)
      } catch (err: any) { setError(err.response?.data?.message || err.message) }
    })()
  }, [])

  const createAttendance = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/api/attendance', {
        studentId: Number(studentId),
        classId: Number(classId),
        subjectId: subjectId ? Number(subjectId) : null,
        date,
        status,
      })
      setStudentId(''); setClassId(''); setSubjectId(''); setDate(''); setStatus('present')
      await load()
      setError(null)
      setSnack({ open: true, msg: 'Attendance recorded', sev: 'success' })
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
      setSnack({ open: true, msg: err.response?.data?.message || err.message, sev: 'error' })
    }
  }

  return (
    <>
      <Box p={3}>
        <Typography variant="h6" gutterBottom>Attendance</Typography>
        {error && <Typography color="error">{error}</Typography>}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box component="form" onSubmit={createAttendance}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel id="student-label">Student</InputLabel>
                <Select labelId="student-label" label="Student" value={studentId} onChange={(e) => setStudentId(e.target.value as string)} required>
                  {studentOpts.map((s: any) => (
                    <MenuItem key={s.id} value={String(s.id)}>{s.firstName} {s.lastName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel id="class-label">Class</InputLabel>
                <Select labelId="class-label" label="Class" value={classId} onChange={(e) => setClassId(e.target.value as string)} required>
                  {classOpts.map((c: any) => (
                    <MenuItem key={c.id} value={String(c.id)}>{c.level} - {c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel id="subject-label">Subject (optional)</InputLabel>
                <Select labelId="subject-label" label="Subject (optional)" value={subjectId} onChange={(e) => setSubjectId(e.target.value as string)}>
                  <MenuItem value="">None</MenuItem>
                  {subjectOpts.map((s: any) => (
                    <MenuItem key={s.id} value={String(s.id)}>{s.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField label="Date" type="date" InputLabelProps={{ shrink: true }} value={date} onChange={(e) => setDate(e.target.value)} required />
              <FormControl sx={{ minWidth: 140 }}>
                <InputLabel id="status-label">Status</InputLabel>
                <Select labelId="status-label" label="Status" value={status} onChange={(e) => setStatus(e.target.value as string)}>
                  <MenuItem value="present">Present</MenuItem>
                  <MenuItem value="absent">Absent</MenuItem>
                  <MenuItem value="late">Late</MenuItem>
                  <MenuItem value="excused">Excused</MenuItem>
                </Select>
              </FormControl>
              <Button type="submit" variant="contained">Add</Button>
            </Stack>
          </Box>
        </Paper>
        <Stack spacing={1}>
          {items.map(a => (
            <Paper key={a.id} sx={{ p: 1.5 }}> {a.date}: student #{a.studentId} - {a.status}</Paper>
          ))}
        </Stack>
      </Box>
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert onClose={() => setSnack(s => ({ ...s, open: false }))} severity={snack.sev} sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  )
}


