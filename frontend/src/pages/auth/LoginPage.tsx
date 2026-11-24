import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box, Paper, Typography, TextField, Button,
  Alert, InputAdornment, IconButton, Grid
} from '@mui/material'
import { Eye, EyeOff, Leaf, Mail, Lock, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { COLORS, SHADOWS } from '../../theme/theme'
import { API_URL } from '../../services/api'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login, user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  React.useEffect(() => {
    if (user) {
      if (user.role === 'client') navigate('/')
      else if (user.role === 'livreur') navigate('/delivery')
      else navigate('/admin')
    }
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: COLORS.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3 },
      }}
    >
      <Paper
        className="dfl-fade-in"
        sx={{
          width: '100%',
          maxWidth: 880,
          overflow: 'hidden',
          borderRadius: 4,
          boxShadow: SHADOWS.cardHover,
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <Grid container>
          {/* Left Brand Panel (Desktop) */}
          <Grid
            item
            md={6}
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              bgcolor: COLORS.darkGreen,
              color: 'white',
              p: 4,
              backgroundImage: `linear-gradient(160deg, rgba(23, 71, 45, 0.90) 0%, rgba(35, 139, 50, 0.80) 100%), url(${API_URL}/uploads/hero-produce.jpg)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <Box sx={{ display: 'inline-flex', alignItems: 'center', bgcolor: 'white', borderRadius: 2.5, px: 1.5, py: 0.6, alignSelf: 'flex-start' }}>
              <Box component="img" src="/logo.png" alt="DFL Fresh" sx={{ height: 38, width: 'auto', objectFit: 'contain' }} />
            </Box>

            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5, lineHeight: 1.25 }}>
                La fraîcheur du marché, livrée chez vous.
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
                Accédez à votre espace client pour commander vos fruits et légumes frais ou gérez votre activité depuis le tableau de bord.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#A5D6A7' }}>
              <ShieldCheck size={18} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Connexion sécurisée JWT & RBAC
              </Typography>
            </Box>
          </Grid>

          {/* Right Form Panel */}
          <Grid item xs={12} md={6} sx={{ p: { xs: 3, sm: 5 }, bgcolor: COLORS.white }}>
            <Box sx={{ textAlign: 'center', mb: 3.5 }}>
              <Box
                component="img"
                src="/logo.png"
                alt="DFL Fresh"
                sx={{ height: 56, width: 'auto', objectFit: 'contain', mx: 'auto', mb: 1.5 }}
              />
              <Typography variant="h5" sx={{ fontWeight: 800, color: COLORS.darkGreen }}>
                Bienvenue sur DFL Fresh
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.textSecondary, mt: 0.5 }}>
                Connectez-vous à votre compte
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Adresse email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ mb: 2.25 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={17} color={COLORS.textSecondary} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Mot de passe"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={17} color={COLORS.textSecondary} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPass(!showPass)} edge="end" aria-label="Afficher le mot de passe">
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading}
                size="large"
                sx={{
                  py: 1.35,
                  mb: 2.5,
                  bgcolor: COLORS.primaryGreen,
                  '&:hover': { bgcolor: COLORS.darkGreen },
                }}
              >
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </Button>
            </form>

            <Typography variant="body2" sx={{ textAlign: 'center', color: COLORS.textSecondary }}>
              Pas encore de compte ?{' '}
              <Link to="/register" style={{ color: COLORS.primaryGreen, fontWeight: 700 }}>
                Créer un compte
              </Link>
            </Typography>

            <Box sx={{ mt: 3, p: 1.5, bgcolor: COLORS.lightGreen, borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: COLORS.darkGreen, display: 'block' }}>
                <strong>Compte Admin :</strong> admin@dflfresh.ma / Admin@2024!
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}

export default LoginPage
