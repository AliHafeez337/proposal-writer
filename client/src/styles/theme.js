import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          transition: 'transform 0.15s ease-in-out',
          '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }
        },
      },
    },
  },
});

export default theme;