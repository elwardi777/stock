import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Box, Paper, Typography, TextField, Button, Alert, InputAdornment, IconButton } from '@mui/material'
import { Leaf, UserRound, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { COLORS, SHADOWS } from '../../theme/theme'

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm_password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm_password) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/login', { state: { message: 'Compte créé avec succès! Connectez-vous.' } })
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la création du compte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: COLORS.background, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Paper
        className="dfl-fade-in"
        sx={{
          width: '100%',
          maxWidth: 460,
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          boxShadow: SHADOWS.cardHover,
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            component="img"
            src="/logo.png"
            alt="DFL Fresh"
            sx={{ height: 56, width: 'auto', objectFit: 'contain', mx: 'auto', mb: 1.5 }}
          />
          <Typography variant="h5" sx={{ fontWeight: 800, color: COLORS.darkGreen }}>
            Créer un compte client
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.textSecondary, mt: 0.5 }}>
            Rejoignez DFL Fresh et commandez en ligne
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          {[
            { key: 'full_name', label: 'Nom complet', type: 'text', icon: <UserRound size={17} color={COLORS.textSecondary} /> },
            { key: 'email', label: 'Adresse email', type: 'email', icon: <Mail size={17} color={COLORS.textSecondary} /> },
            { key: 'phone', label: 'Téléphone', type: 'tel', icon: <Phone size={17} color={COLORS.textSecondary} /> },
          ].map((field) => (
            <TextField
              key={field.key}
              fullWidth
              label={field.label}
              type={field.type}
              value={(form as any)[field.key]}
              onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
              required
              sx={{ mb: 2 }}
              InputProps={{ startAdornment: <InputAdornment position="start">{field.icon}</InputAdornment> }}
            />
          ))}

          <TextField
            fullWidth
            label="Mot de passe"
            type={showPass ? 'text' : 'password'}
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            required
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Lock size={17} color={COLORS.textSecondary} /></InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPass(!showPass)} edge="end" aria-label="Afficher le mot de passe">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Confirmer le mot de passe"
            type={showPass ? 'text' : 'password'}
            value={form.confirm_password}
            onChange={(e) => setForm((prev) => ({ ...prev, confirm_password: e.target.value }))}
            required
            sx={{ mb: 3 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Lock size={17} color={COLORS.textSecondary} /></InputAdornment> }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ py: 1.35, mb: 2.5, bgcolor: COLORS.primaryGreen, '&:hover': { bgcolor: COLORS.darkGreen } }}
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </Button>
        </form>

        <Typography variant="body2" sx={{ textAlign: 'center', color: COLORS.textSecondary }}>
          Déjà un compte ?{' '}
          <Link to="/login" style={{ color: COLORS.primaryGreen, fontWeight: 700 }}>
            Se connecter
          </Link>
        </Typography>
      </Paper>
    </Box>
  )
}

export default RegisterPage
