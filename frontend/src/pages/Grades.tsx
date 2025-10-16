import { useEffect, useMemo, useState } from 'react'
 import { api } from '../lib/api';
 
import { Box, Button, FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography, Snackbar, Alert } from '@mui/material'

type Student = { id: number; firstName: string; lastName: string; classId?: number }
type Exam = { id: number; name: string; date: string; classId?: number }
type ClassItem = { id: number; level: string; name: string }

export default function Grades() {
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [classId, setClassId] = useState('')
  const [examId, setExamId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [grades, setGrades] = useState<Record<number, string>>({})
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: 'success' | 'error' }>({ open: false, msg: '', sev: 'success' })

  const filteredStudents = useMemo(
    () => students.filter(s => !classId || String(s.classId) === classId),
    [students, classId]
  )
  const filteredExams = useMemo(
    () => exams.filter(e => !classId || String(e.classId) === classId),
    [exams, classId]
  )

  useEffect(() => {
    (async () => {
      try {
        const [sRes, cRes, eRes] = await Promise.all([
          api.get('/api/students'),
          api.get('/api/classroom/classes'),
          api.get('/api/exams/exams'),
        ])
        const sData = Array.isArray(sRes.data) ? sRes.data : sRes.data.data || []
        const cData = Array.isArray(cRes.data) ? cRes.data : cRes.data.data || []
        const eData = Array.isArray(eRes.data) ? eRes.data : eRes.data.data || []
        setStudents(sData)
        setClasses(cData)
        setExams(eData)
      } catch (err: any) {
        setError(err.response?.data?.message || err.message)
      }
    })()
  }, [])

  const submitBulk = async () => {
    try {
      if (!examId) throw new Error('Select an exam')
      const records = filteredStudents
        .map(s => ({ studentId: s.id, examId: Number(examId), grade: grades[s.id] }))
        .filter(r => r.grade && r.grade.trim() !== '')
      if (!records.length) throw new Error('Enter at least one grade')
      await api.post('/api/exams/grades/bulk', { records })
      setGrades({})
      setError(null)
      setSnack({ open: true, msg: 'Grades submitted', sev: 'success' })
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
      setSnack({ open: true, msg: err.response?.data?.message || err.message, sev: 'error' })
    }
  }

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>Record Grades</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel id="class-label">Class</InputLabel>
            <Select labelId="class-label" label="Class" value={classId} onChange={(e) => setClassId(e.target.value as string)}>
              <MenuItem value="">All</MenuItem>
              {classes.map(c => (
                <MenuItem key={c.id} value={String(c.id)}>{c.level} - {c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel id="exam-label">Exam</InputLabel>
            <Select labelId="exam-label" label="Exam" value={examId} onChange={(e) => setExamId(e.target.value as string)}>
              {filteredExams.map(e => (
                <MenuItem key={e.id} value={String(e.id)}>{e.name} ({e.date})</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={submitBulk}>Submit Grades</Button>
        </Stack>
      </Paper>
      <Stack spacing={1}>
        {filteredStudents.map(s => (
          <Paper key={s.id} sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
            <span style={{ minWidth: 220 }}>{s.firstName} {s.lastName}</span>
            <TextField size="small" label="Grade" value={grades[s.id] || ''} onChange={(e) => setGrades(g => ({ ...g, [s.id]: e.target.value }))} sx={{ maxWidth: 160 }} />
          </Paper>
        ))}
      </Stack>
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert onClose={() => setSnack(s => ({ ...s, open: false }))} severity={snack.sev} sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}


