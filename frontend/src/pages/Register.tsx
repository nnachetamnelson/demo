import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
 import { api } from '../lib/api';
 
import { Box, Button, Container, TextField, Typography, Paper, Stack, Alert, Checkbox, FormControlLabel, FormGroup, FormLabel } from '@mui/material'

export default function Register() {
  const [tenantId, setTenantId] = useState('')


  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [subjects, setSubjects] = useState<any[]>([])
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const navigate = useNavigate()

  // Fetch available subjects when tenantId changes
  useEffect(() => {
    if (tenantId && tenantId.length >= 3) {
      fetchSubjects()
    } else {
      setSubjects([])
    }
  }, [tenantId])

  const fetchSubjects = async () => {
    try {
      const res = await api.get(`/api/public/subjects/${tenantId}`)
      setSubjects(res.data.data || [])
    } catch (err) {
      // If no subjects found, that's ok - user can register without selecting any
      setSubjects([])
    }
  }

  const handleSubjectToggle = (subjectId: number) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    )
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    try {
      const res = await api.post('/api/auth/register', {
        tenantId,
        username,
        email,
        password,
        firstName,
        lastName,
        dateOfBirth: dateOfBirth || undefined,
        schoolName,
        subjectIds: selectedSubjects.length > 0 ? selectedSubjects : undefined
      })
      setSuccess(`Registration successful! Welcome ${firstName}!`)
      // Auto-login after registration
      const token = res.data.tokens?.accessToken || res.data.accessToken
      if (token) {
        localStorage.setItem('token', token)
        setTimeout(() => navigate('/'), 2000)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Create Accounts
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom align="center" sx={{ mb: 3 }}>
          Register for your school's education platform
        </Typography>

        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={2.5}>
            <TextField
              label="School ID"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              required
              fullWidth
              placeholder="e.g., school1"
              helperText="Your school's unique identifier"
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                fullWidth
                placeholder="John"
              />
              <TextField
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                fullWidth
                placeholder="Smith"
              />
            </Box>

            <TextField
              label="Date of Birth (Optional)"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              fullWidth
              placeholder="Username or Student ID"
              helperText="Your unique username (e.g., john.smith or S2024001)"
            />

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              placeholder="your.email@school.com"
              helperText="For notifications and account recovery"
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              helperText="Minimum 6 characters"
            />

            {subjects.length > 0 && (
              <Box sx={{ mt: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                <FormLabel component="legend">Select Your Subjects (Optional)</FormLabel>
                <FormGroup>
                  {subjects.map((subject: any) => (
                    <FormControlLabel
                      key={subject.id}
                      control={
                        <Checkbox
                          checked={selectedSubjects.includes(subject.id)}
                          onChange={() => handleSubjectToggle(subject.id)}
                        />
                      }
                      label={subject.name}
                    />
                  ))}
                </FormGroup>
              </Box>
            )}

            <TextField
              label="School Name (Optional)"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              fullWidth
              placeholder="e.g., Lincoln High School"
            />

            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            <Button type="submit" variant="contained" size="large" fullWidth>
              Register
            </Button>

            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2' }}>
                Sign in
              </Link>
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </Container>
  )
}
