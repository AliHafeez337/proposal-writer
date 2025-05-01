// src/components/Layout/RootLayout.jsx
import { Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

export default function RootLayout() {
  return (
    <Container
      component="main"
      maxWidth="xl"
      sx={{
        mt: 4,
        mb: 4,
        mx: 'auto',
        width: '100%',
        maxWidth: 'lg', // Default MUI breakpoint (1280px)
        px: { xs: 2, sm: 3 },
      }}
    >
      <Outlet /> {/* Child routes render here */}
    </Container>
  );
}