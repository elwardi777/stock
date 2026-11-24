import React, { useState } from 'react'
import {
  AppBar, Toolbar, IconButton, Box, Avatar, Typography,
  Menu, MenuItem, Badge, Tooltip
} from '@mui/material'
import { Menu as MenuIcon, Bell, ChevronDown } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { COLORS } from '../../theme/theme'

interface Props {
  onMenuClick: () => void
}

const AdminHeader: React.FC<Props> = ({ onMenuClick }) => {
  const { user, logout } = useAuth()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  return (
    <AppBar position="sticky" elevation={0} sx={{
      bgcolor: 'white',
      borderBottom: `1px solid ${COLORS.border}`,
      zIndex: (theme) => theme.zIndex.drawer - 1,
    }}>
      <Toolbar sx={{ gap: 1 }}>
        <IconButton onClick={onMenuClick} sx={{ display: { md: 'none' }, color: COLORS.textPrimary }}>
          <MenuIcon size={22} />
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title="Notifications">
          <IconButton sx={{ color: COLORS.textSecondary }}>
            <Badge badgeContent={0} color="error">
              <Bell size={20} />
            </Badge>
          </IconButton>
        </Tooltip>

        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', ml: 1 }}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          <Avatar sx={{ bgcolor: COLORS.primaryGreen, width: 34, height: 34, fontSize: '0.85rem' }}>
            {user?.full_name.charAt(0)}
          </Avatar>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2, color: COLORS.textPrimary }}>
              {user?.full_name}
            </Typography>
            <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontSize: '0.7rem' }}>
              {user?.role}
            </Typography>
          </Box>
          <ChevronDown size={16} color={COLORS.textSecondary} />
        </Box>

        <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => { setAnchorEl(null); logout() }}>
            Déconnexion
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}

export default AdminHeader

