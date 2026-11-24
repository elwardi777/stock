import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, Button, Container } from '@mui/material'
import { COLORS, TRANSITIONS } from '../../theme/theme'

const NAV_ITEMS = [
  { label: 'Accueil', path: '/' },
  { label: 'Nos Produits', path: '/produits' },
  { label: 'Packs & Paniers', path: '/produits?category=paniers-prets' },
  { label: 'Promotions', path: '/produits?promo=true' },
  { label: 'Mes Commandes', path: '/mes-commandes' },
]

const ClientNavBar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => {
    const currentFull = location.pathname + location.search
    if (path === '/') return location.pathname === '/'
    if (path.includes('?')) return currentFull === path
    return location.pathname === path && !location.search
  }

  return (
    <Box
      sx={{
        bgcolor: COLORS.white,
        borderBottom: `1px solid ${COLORS.border}`,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1.5 }, overflowX: 'auto' }}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path)
            return (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  py: 1.35,
                  px: 1.75,
                  borderRadius: 0,
                  color: active ? COLORS.primaryGreen : COLORS.textPrimary,
                  borderBottom: active ? `2px solid ${COLORS.primaryGreen}` : '2px solid transparent',
                  fontWeight: active ? 700 : 500,
                  fontSize: '0.88rem',
                  minWidth: 'max-content',
                  transition: TRANSITIONS.fast,
                  '&:hover': {
                    color: COLORS.primaryGreen,
                    bgcolor: 'rgba(35, 139, 50, 0.04)',
                  },
                }}
              >
                {item.label}
              </Button>
            )
          })}
        </Box>
      </Container>
    </Box>
  )
}

export default ClientNavBar
