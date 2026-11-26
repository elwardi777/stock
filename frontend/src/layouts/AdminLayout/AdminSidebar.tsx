import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Drawer, Box, Typography, List, ListItemButton, ListItemIcon,
  ListItemText, Divider, Avatar
} from '@mui/material'
import {
  LayoutDashboard, Users, Package, Warehouse, ShoppingCart,
  Truck, Tag, BarChart2, FileText, Settings, LogOut, Store
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { COLORS } from '../../theme/theme'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
  permission?: string
  roles?: string[]
}

interface NavSection {
  section: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    section: 'GÉNÉRAL',
    items: [
      { label: 'Tableau de bord', path: '/admin', icon: <LayoutDashboard size={18} />, permission: 'dashboard' },
    ],
  },
  {
    section: 'GESTION',
    items: [
      { label: 'Utilisateurs', path: '/admin/users', icon: <Users size={18} />, permission: 'users' },
      {
        label: 'Clients & Besoins',
        path: '/admin/clients',
        icon: <Store size={18} />,
        permission: 'clients',
        roles: ['administrator', 'admin', 'commercial'],
      },
      { label: 'Catalogue produits', path: '/admin/products', icon: <Package size={18} />, permission: 'products' },
      { label: 'Gestion du stock', path: '/admin/stock', icon: <Warehouse size={18} />, permission: 'stock' },
      { label: 'Commandes', path: '/admin/orders', icon: <ShoppingCart size={18} />, permission: 'orders' },
      { label: 'Livraisons', path: '/admin/deliveries', icon: <Truck size={18} />, permission: 'deliveries' },
      { label: 'Promotions & Packs', path: '/admin/promotions', icon: <Tag size={18} />, permission: 'promotions' },
    ],
  },
  {
    section: 'FINANCE',
    items: [
      { label: 'Finances & Rapports', path: '/admin/finance', icon: <BarChart2 size={18} />, permission: 'finance' },
    ],
  },
  {
    section: 'SYSTÈME',
    items: [
      { label: "Journal d'activité", path: '/admin/audit', icon: <FileText size={18} />, permission: 'audit' },
      { label: 'Paramètres', path: '/admin/settings', icon: <Settings size={18} />, permission: 'settings' },
    ],
  },
]

interface Props {
  open: boolean
  onClose: () => void
  width: number
}

const AdminSidebar: React.FC<Props> = ({ open, onClose, width }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, hasPermission, logout } = useAuth()

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(path)
  }

  const canSee = (item: NavItem) => {
    const role = (user?.role || '').toLowerCase().trim()
    if (role === 'administrator' || role === 'admin') return true
    if (item.roles && item.roles.includes(role)) return true
    if (!item.permission) return true
    return hasPermission(item.permission, 'view')
  }

  const content = (
    <Box sx={{
      width,
      height: '100%',
      bgcolor: COLORS.darkGreen,
      display: 'flex',
      flexDirection: 'column',
      color: 'white',
    }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          bgcolor: 'white',
          borderRadius: 2.5,
          px: 1.5,
          py: 0.75,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}>
          <Box component="img" src="/logo.png" alt="DFL Fresh" sx={{ height: 40, width: 'auto', objectFit: 'contain' }} />
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 1 }}>
        {NAV_SECTIONS.map((section) => {
          const visibleItems = section.items.filter(canSee)
          if (visibleItems.length === 0) return null
          return (
            <Box key={section.section} sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                px: 3, py: 1,
                display: 'block',
              }}>
                {section.section}
              </Typography>
              <List dense disablePadding>
                {visibleItems.map((item) => (
                  <ListItemButton
                    key={item.path}
                    onClick={() => {
                      navigate(item.path)
                      onClose()
                    }}
                    sx={{
                      mx: 1.5, mb: 0.5,
                      borderRadius: 2,
                      color: isActive(item.path) ? 'white' : 'rgba(255,255,255,0.7)',
                      bgcolor: isActive(item.path) ? COLORS.primaryGreen : 'transparent',
                      '&:hover': {
                        bgcolor: isActive(item.path) ? COLORS.primaryGreen : 'rgba(255,255,255,0.08)',
                        color: 'white',
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isActive(item.path) ? 600 : 400 }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Box>
          )
        })}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar sx={{ bgcolor: COLORS.primaryGreen, width: 36, height: 36, fontSize: '0.875rem' }}>
            {user?.full_name.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, lineHeight: 1.2 }} noWrap>
              {user?.full_name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>
              {user?.role}
            </Typography>
          </Box>
        </Box>
        <ListItemButton
          onClick={logout}
          sx={{
            borderRadius: 2,
            color: 'rgba(255,255,255,0.7)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: '#ff6b6b' },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
            <LogOut size={16} />
          </ListItemIcon>
          <ListItemText primary="Déconnexion" primaryTypographyProps={{ fontSize: '0.875rem' }} />
        </ListItemButton>
      </Box>
    </Box>
  )

  return (
    <>
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width,
            border: 'none',
            bgcolor: COLORS.darkGreen,
          },
        }}
      >
        {content}
      </Drawer>
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width,
            border: 'none',
            bgcolor: COLORS.darkGreen,
          },
        }}
      >
        {content}
      </Drawer>
    </>
  )
}

export default AdminSidebar

