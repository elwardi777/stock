import React, { useState } from 'react'
import { Container, Typography, Card, CardContent, TextField, Button, Box } from '@mui/material'
import { LogOut } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import { authApi } from '../../../services/api'
import { useSnackbar } from 'notistack'
import { COLORS } from '../../../theme/theme'

const ClientProfilePage: React.FC = () => {
  const { user, updateUser, logout } = useAuth()
  const { enqueueSnackbar } = useSnackbar()
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [phone, setPhone] = useState(user?.phone || '')

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await authApi.updateMe({ full_name: fullName, phone })
      updateUser(res.data)
      enqueueSnackbar('Profil mis à jour', { variant: 'success' })
    } catch {
      enqueueSnackbar('Erreur lors de la mise à jour', { variant: 'error' })
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }} className="dfl-fade-in">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Mon Profil</Typography>
        <Button
          type="button"
          variant="outlined"
          color="error"
          startIcon={<LogOut size={16} />}
          onClick={() => logout()}
        >
          Déconnexion
        </Button>
      </Box>
      <Card>
        <CardContent sx={{ p: 3 }}>
          <form onSubmit={handleUpdate}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Nom complet" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              <TextField label="Email" value={user?.email || ''} disabled />
              <TextField label="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start', bgcolor: COLORS.primaryGreen, '&:hover': { bgcolor: COLORS.darkGreen } }}>
                Enregistrer
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  )
}

export default ClientProfilePage
