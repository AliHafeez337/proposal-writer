import { AppBar, Toolbar, Typography, Button, Box, Container, Stack, Chip } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function Navbar() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  // Function to handle user logout
  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AppBar position="sticky">
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ px: { xs: 1.5, sm: 2 } }}>
          <Typography
            variant="h6"
            component="div"
            onClick={() => navigate('/')}
            sx={{
              flexGrow: 1,
              cursor: 'pointer',
              userSelect: 'none',
              fontWeight: 900,
              letterSpacing: '-0.02em',
            }}
          >
            Proposal Writer
          </Typography>

          {user ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <Button color="inherit" onClick={() => navigate('/proposals')}>
                Proposals
              </Button>
              <Chip
                size="small"
                label={user?.email || 'Signed in'}
                sx={{
                  ml: 0.5,
                  bgcolor: 'rgba(0,0,0,0.04)',
                  borderColor: 'rgba(0,0,0,0.10)',
                }}
                variant="outlined"
              />
              <Box sx={{ width: 8 }} />
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </Stack>
          ) : (
            <Stack direction="row" spacing={1} alignItems="center">
              <Button color="inherit" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button variant="contained" onClick={() => navigate('/register')}>
                Create account
              </Button>
            </Stack>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}