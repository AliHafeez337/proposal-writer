import { Container, Box, Typography, Link } from '@mui/material';
import { Link as LoginLink } from 'react-router-dom';
import RegisterForm from '../../components/Auth/RegisterForm';

export default function Register() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4" align="center">Register</Typography>
        <RegisterForm />
        <Typography variant="body1" sx={{ mt: 3 }}>
          Already have an account?{' '}
          <Link component={LoginLink} to="/login">
            Login here
          </Link>
        </Typography>
      </Box>
    </Container>
  );
}