import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  shape: {
    borderRadius: 14,
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#7c3aed',
    },
    background: {
      default: '#f7f8fc',
      paper: 'rgba(255,255,255,0.78)',
    },
    text: { primary: '#0f172a', secondary: 'rgba(15,23,42,0.70)' },
    divider: 'rgba(15,23,42,0.10)',
  },
  typography: {
    fontFamily:
      '"Plus Jakarta Sans", system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    button: { textTransform: 'none', fontWeight: 700 },
    h4: { fontWeight: 800, letterSpacing: '-0.02em' },
    h5: { fontWeight: 800, letterSpacing: '-0.01em' },
    h6: { fontWeight: 800, letterSpacing: '-0.01em' },
    body1: { letterSpacing: '-0.005em' },
    body2: { letterSpacing: '-0.005em' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { height: '100%' },
        body: {
          height: '100%',
          backgroundColor: '#f7f8fc',
          backgroundImage:
            'radial-gradient(900px 520px at 15% -10%, rgba(37,99,235,0.18) 0%, rgba(37,99,235,0) 60%), radial-gradient(900px 520px at 90% 0%, rgba(124,58,237,0.14) 0%, rgba(124,58,237,0) 55%), radial-gradient(900px 520px at 50% 110%, rgba(16,185,129,0.10) 0%, rgba(16,185,129,0) 55%)',
          backgroundAttachment: 'fixed',
        },
        '#root': { minHeight: '100%' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(15,23,42,0.08)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255,255,255,0.78)',
          borderRadius: 18,
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        color: 'transparent',
      },
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(15,23,42,0.08)',
          backgroundColor: 'rgba(247,248,252,0.70)',
          backdropFilter: 'blur(14px)',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 64,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingInline: 14,
          transition: 'transform 140ms ease, background-color 140ms ease, border-color 140ms ease',
          '&:active': { transform: 'translateY(1px)' },
        },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          '&.Mui-focusVisible': {
            outline: '2px solid rgba(37,99,235,0.35)',
            outlineOffset: 2,
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundColor: 'rgba(255,255,255,0.92)',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(15,23,42,0.18)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(37,99,235,0.55)',
            borderWidth: 1,
          },
        },
        notchedOutline: {
          borderColor: 'rgba(15,23,42,0.14)',
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: '1rem',
          lineHeight: 1.5
        },
        secondary: {
          fontSize: '0.875rem',
          lineHeight: 1.5
        }
      }
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          marginLeft: 16,
          marginRight: 16
        }
      }
    }
  },
});

export default theme;