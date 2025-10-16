import { Link } from 'react-router-dom'
import { AppBar, Toolbar, Button, Stack } from '@mui/material'
import { useAuth } from '../auth/AuthContext'

export default function Nav() {
  const { setToken } = useAuth()
  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 2 }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1}>
          <Button component={Link} to="/">Dashboard</Button>
          <Button component={Link} to="/students">Students</Button>
          <Button component={Link} to="/classes">Class Management</Button>
          <Button component={Link} to="/attendance">Attendance</Button>
          <Button component={Link} to="/exams">Exams</Button>
          <Button component={Link} to="/reports">Reports</Button>
          <Button component={Link} to="/grades">Grades</Button>
          <Button component={Link} to="/notifications">Notifications</Button>
          <Button component={Link} to="/profiles">Profiles</Button>
          <Button component={Link} to="/portal">Portal</Button>
        </Stack>
        <Button variant="contained" onClick={() => setToken(null)}>Logout</Button>
      </Toolbar>
    </AppBar>
  )
}


