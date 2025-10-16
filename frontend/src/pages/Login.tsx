import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../auth/AuthContext'
import { Box, Button, Container, TextField, Typography, Paper, Stack } from '@mui/material'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [tenantId, setTenantId] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { setAccessToken } = useAuth();
  const navigate = useNavigate()


  const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  try {
    const res = await api.post('/api/auth/login', { username, password, tenantId });
    const token = res.data.tokens?.accessToken || res.data.accessToken;
    if (!token) throw new Error('No token returned');
    setAccessToken(token);
    navigate('/');
  } catch (err: any) {
    setError(err.response?.data?.message || err.message);
  }
};

  return (
    <Container maxWidth="sm" sx={{ mt: 12 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Sign in</Typography>
        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={2}>
            <TextField label="Username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required fullWidth placeholder="Username or Student ID" />
            <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth />
            <TextField label="School ID" value={tenantId} onChange={(e) => setTenantId(e.target.value)} required fullWidth placeholder="e.g., school1" helperText="Enter your school's tenant ID" />
            <Button type="submit" variant="contained" fullWidth>Login</Button>
            {error && <Typography color="error">{error}</Typography>}
            
            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ textDecoration: 'none', color: '#1976d2' }}>
                Register here
              </Link>
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </Container>
  )
}