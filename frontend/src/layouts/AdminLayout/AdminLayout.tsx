import React, { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Box } from '@mui/material'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

const SIDEBAR_WIDTH = 260

const AdminLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()

  // Scroll to top cleanly when navigating between admin modules
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%', bgcolor: '#F5F7F5' }}>
      <Box
        component="nav"
        sx={{ width: { md: SIDEBAR_WIDTH }, flexShrink: { md: 0 } }}
        aria-label="admin navigation"
      >
        <AdminSidebar
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          width={SIDEBAR_WIDTH}
        />
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <AdminHeader onMenuClick={() => setMobileOpen((prev) => !prev)} />
        <Box sx={{ p: { xs: 2, sm: 3 }, flexGrow: 1, minWidth: 0 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default AdminLayout
