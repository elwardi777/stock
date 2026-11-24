import React from 'react'
import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import ClientHeader from './ClientHeader'
import ClientFooter from './ClientFooter'
import CartDrawer from '../../components/cart/CartDrawer'

const ClientLayout: React.FC = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FFFFFF' }}>
    <ClientHeader />
    <Box component="main" sx={{ flexGrow: 1 }}>
      <Outlet />
    </Box>
    <ClientFooter />
    <CartDrawer />
  </Box>
)

export default ClientLayout
