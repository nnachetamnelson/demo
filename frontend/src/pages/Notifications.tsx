import { useEffect, useState } from 'react'
 import { api } from '../lib/api';

import { Box, Button, FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography, Snackbar, Alert } from '@mui/material'

type Notif = { id: number; type: string; eventType: string; content: string }

export default function Notifications() {
  const [items, setItems] = useState<Notif[]>([])
  const [error, setError] = useState<string | null>(null)
  // send form
  const [studentId, setStudentId] = useState('')
  const [target, setTarget] = useState<'student' | 'parents' | 'both'>('student')
  const [type, setType] = useState<'email' | 'sms' | 'in_app'>('email')
  const [eventType, setEventType] = useState<'grade_updated' | 'attendance_alert' | 'report_card' | 'exam_reminder' | 'custom'>('custom')
  const [content, setContent] = useState('')
  const [students, setStudents] = useState<any[]>([])
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: 'success' | 'error' }>({ open: false, msg: '', sev: 'success' })

  const load = async () => {
    const res = await api.get('/api/notifications')
    const data = Array.isArray(res.data?.data) ? res.data.data : []
    setItems(data)
  }

  useEffect(() => {
    (async () => {
      try {
        await load()
        const sRes = await api.get('/api/students')
        const sData = Array.isArray(sRes.data) ? sRes.data : sRes.data.data || []
        setStudents(sData)
      } catch (err: any) {
        setError(err.response?.data?.message || err.message)
      }
    })()
  }, [])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/api/notifications', {
        studentId: Number(studentId),
        target, type, eventType, content
      })
      setContent('')
      await load()
      setError(null)
      setSnack({ open: true, msg: 'Notification sent', sev: 'success' })
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
      setSnack({ open: true, msg: err.response?.data?.message || err.message, sev: 'error' })
    }
  }

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>Notifications</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box component="form" onSubmit={send}>
          <Stack spacing={2} direction={{ xs: 'column', md: 'row' }}>
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel id="student-label">Student</InputLabel>
              <Select labelId="student-label" label="Student" value={studentId} onChange={(e) => setStudentId(e.target.value as string)} required>
                {students.map((s: any) => (
                  <MenuItem key={s.id} value={String(s.id)}>{s.firstName} {s.lastName}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 140 }}>
              <InputLabel id="target-label">Target</InputLabel>
              <Select labelId="target-label" label="Target" value={target} onChange={(e) => setTarget(e.target.value as any)}>
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="parents">Parents</MenuItem>
                <MenuItem value="both">Both</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 140 }}>
              <InputLabel id="type-label">Type</InputLabel>
              <Select labelId="type-label" label="Type" value={type} onChange={(e) => setType(e.target.value as any)}>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="sms">SMS</MenuItem>
                <MenuItem value="in_app">In App</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 170 }}>
              <InputLabel id="event-label">Event</InputLabel>
              <Select labelId="event-label" label="Event" value={eventType} onChange={(e) => setEventType(e.target.value as any)}>
                <MenuItem value="grade_updated">Grade Updated</MenuItem>
                <MenuItem value="attendance_alert">Attendance Alert</MenuItem>
                <MenuItem value="report_card">Report Card</MenuItem>
                <MenuItem value="exam_reminder">Exam Reminder</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Content" value={content} onChange={(e) => setContent(e.target.value)} fullWidth />
            <Button type="submit" variant="contained">Send</Button>
          </Stack>
        </Box>
      </Paper>
      <Stack spacing={1}>
        {items.map(n => (
          <Paper key={n.id} sx={{ p: 1.5 }}>{n.type} - {n.eventType}: {n.content}</Paper>
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


