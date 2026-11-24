import { createTheme } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    darkGreen: Palette['primary']
    lightGreen: Palette['primary']
  }
  interface PaletteOptions {
    darkGreen?: PaletteOptions['primary']
    lightGreen?: PaletteOptions['primary']
  }
}

export const COLORS = {
  darkGreen: '#17472D',
  primaryGreen: '#238B32',
  naturalGreen: '#4CAF50',
  lightGreen: '#E8F5E9',
  white: '#FFFFFF',
  background: '#F5F7F5',
  border: '#E5E9E5',
  textPrimary: '#18251C',
  textSecondary: '#737D75',
  success: '#2e7d32',
  warning: '#ed6c02',
  error: '#d32f2f',
  info: '#0288d1',
}

export const SHADOWS = {
  card: '0 2px 12px rgba(23, 71, 45, 0.05)',
  cardHover: '0 10px 28px rgba(23, 71, 45, 0.10)',
  header: '0 1px 8px rgba(23, 71, 45, 0.06)',
}

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
}

export const TRANSITIONS = {
  fast: 'all 0.18s cubic-bezier(0.22, 1, 0.36, 1)',
  smooth: 'all 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
}

export const theme = createTheme({
  palette: {
    primary: {
      main: COLORS.primaryGreen,
      dark: COLORS.darkGreen,
      light: COLORS.naturalGreen,
      contrastText: '#fff',
    },
    secondary: {
      main: COLORS.naturalGreen,
      contrastText: '#fff',
    },
    success: { main: COLORS.success },
    warning: { main: COLORS.warning },
    error: { main: COLORS.error },
    info: { main: COLORS.info },
    background: {
      default: COLORS.background,
      paper: COLORS.white,
    },
    text: {
      primary: COLORS.textPrimary,
      secondary: COLORS.textSecondary,
    },
    darkGreen: {
      main: COLORS.darkGreen,
      contrastText: '#fff',
    },
    lightGreen: {
      main: COLORS.lightGreen,
    },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: { fontWeight: 700, fontSize: '2.25rem', letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, fontSize: '1.875rem', letterSpacing: '-0.015em' },
    h3: { fontWeight: 600, fontSize: '1.5rem', letterSpacing: '-0.01em' },
    h4: { fontWeight: 700, fontSize: '1.35rem', letterSpacing: '-0.01em' },
    h5: { fontWeight: 600, fontSize: '1.125rem' },
    h6: { fontWeight: 600, fontSize: '1rem' },
    body1: { fontSize: '0.95rem' },
    body2: { fontSize: '0.875rem' },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: RADIUS.sm,
          boxShadow: 'none',
          transition: TRANSITIONS.fast,
          '&:hover': { boxShadow: 'none' },
          '&:active': { transform: 'scale(0.98)' },
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: COLORS.darkGreen,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: RADIUS.md,
          boxShadow: SHADOWS.card,
          border: `1px solid ${COLORS.border}`,
          transition: TRANSITIONS.smooth,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: RADIUS.md,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: RADIUS.sm,
            '& fieldset': { borderColor: COLORS.border },
            '&:hover fieldset': { borderColor: COLORS.naturalGreen },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: COLORS.primaryGreen,
            },
          },
          '& label.Mui-focused': {
            color: COLORS.primaryGreen,
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#F5F7F5',
            fontWeight: 700,
            color: COLORS.textSecondary,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            borderBottom: `1px solid ${COLORS.border}`,
            whiteSpace: 'nowrap',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.15s ease',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 600 },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          width: '100%',
          overflowX: 'auto',
          overflowY: 'visible',
          border: `1px solid ${COLORS.border}`,
          boxShadow: SHADOWS.card,
        },
      },
    },
    MuiDialog: {
      defaultProps: {
        scroll: 'paper',
      },
      styleOverrides: {
        paper: {
          maxHeight: 'calc(100vh - 48px)',
          borderRadius: RADIUS.md,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          overflowY: 'auto',
        },
      },
    },
  },
})
