import React from 'react'
import { Outlet } from 'react-router-dom'
import { Box, AppBar, Toolbar, Typography, Button, Avatar } from '@mui/material'
import { LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { COLORS } from '../../theme/theme'

const DeliveryLayout: React.FC = () => {
  const { user, logout } = useAuth()
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F7F5' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: COLORS.darkGreen }}>
        <Toolbar>
          <Box sx={{ bgcolor: 'white', borderRadius: 2, px: 1.25, py: 0.4, display: 'flex', alignItems: 'center' }}>
            <Box component="img" src="/logo.png" alt="DFL Fresh" sx={{ height: 32, width: 'auto', objectFit: 'contain' }} />
          </Box>
          <Typography variant="caption" sx={{ ml: 1.5, color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>Livreur</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Avatar sx={{ bgcolor: COLORS.primaryGreen, mr: 1, width: 32, height: 32 }}>
            {user?.full_name.charAt(0)}
          </Avatar>
          <Button onClick={logout} startIcon={<LogOut size={16} />} sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Déconnexion
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 2 }}>
        <Outlet />
      </Box>
    </Box>
  )
}

export default DeliveryLayout

