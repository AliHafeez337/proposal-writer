import { Container, Box, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LoginForm from '../../components/Auth/LoginForm';

export default function Login() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>Login</Typography>
        <LoginForm />
        <Typography variant="body1" sx={{ mt: 3 }}>
          Don't have an account?{' '}
          <Link component={RouterLink} to="/register">
            Register here
          </Link>
        </Typography>
      </Box>
    </Container>
  );
}