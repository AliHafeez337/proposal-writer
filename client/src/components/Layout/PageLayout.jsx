import { Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

export default function PageLayout() {
  return (
    <Container
      component="main"
      maxWidth={false}
      sx={{
        mt: { xs: 3, sm: 4 },
        mb: { xs: 6, sm: 8 },
        mx: 'auto',
        width: '100%',
        maxWidth: 1120,
        px: { xs: 2, sm: 3 },
      }}
    >
      <Outlet /> {/* Child routes render here */}
    </Container>
  );
}