import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar, Toolbar, Container, Box, InputBase, IconButton, Badge,
  Button, Typography, Menu, MenuItem, ListItemIcon, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, Select, FormControl, InputLabel
} from '@mui/material'
import {
  Search, ShoppingBag, UserRound, LogOut, ChevronDown,
  Package, LayoutDashboard, Truck, Tag, Apple, Cherry,
  Carrot, Citrus, Leaf, ShoppingBasket, Sparkles, MapPin
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { categoriesApi } from '../../services/api'
import { COLORS } from '../../theme/theme'

const MEGA_MENU_DATA: Record<
  string,
  {
    tabs: { key: string; label: string; slug: string; items: { label: string; query: string }[] }[]
  }
> = {
  'fruits-legumes': {
    tabs: [
      {
        key: 'fruits',
        label: 'Fruits',
        slug: 'fruits',
        items: [
          { label: 'Pommes Rouges', query: 'Pommes' },
          { label: 'Bananes', query: 'Bananes' },
          { label: 'Oranges & Agrumes', query: 'Oranges' },
          { label: 'Fraises', query: 'Fraises' },
          { label: 'Avocats', query: 'Avocats' },
          { label: 'Poires', query: 'Poires' },
          { label: 'Raisins', query: 'Raisins' },
          { label: 'Citrons', query: 'Citrons' },
          { label: 'Pêches', query: 'Pêches' },
        ],
      },
      {
        key: 'legumes',
        label: 'Légumes',
        slug: 'legumes',
        items: [
          { label: 'Tomates Rondes', query: 'Tomates' },
          { label: 'Pommes de Terre', query: 'Pommes de Terre' },
          { label: 'Carottes', query: 'Carottes' },
          { label: 'Oignons', query: 'Oignons' },
          { label: 'Concombres', query: 'Concombres' },
          { label: 'Poivrons Verts', query: 'Poivrons' },
          { label: 'Aubergines', query: 'Aubergines' },
          { label: 'Courgettes', query: 'Courgettes' },
          { label: 'Chou-Fleur', query: 'Chou-Fleur' },
          { label: 'Laitue', query: 'Laitue' },
        ],
      },
      {
        key: 'fruits-exotiques',
        label: 'Fruits Exotiques',
        slug: 'fruits-exotiques',
        items: [
          { label: 'Mangues', query: 'Mangues' },
          { label: 'Ananas', query: 'Ananas' },
          { label: 'Papaye', query: 'Papaye' },
          { label: 'Kiwi', query: 'Kiwi' },
          { label: 'Fruit du Dragon', query: 'Dragon' },
        ],
      },
      {
        key: 'herbes',
        label: 'Herbes',
        slug: 'herbes',
        items: [
          { label: 'Persil', query: 'Persil' },
          { label: 'Coriandre', query: 'Coriandre' },
          { label: 'Menthe Fraîche', query: 'Menthe' },
          { label: 'Basilic', query: 'Basilic' },
        ],
      },
      {
        key: 'paniers-prets',
        label: 'Paniers Prêts',
        slug: 'paniers-prets',
        items: [
          { label: 'Panier Familial Mix', query: 'Panier Familial' },
          { label: 'Panier Premium Fruits', query: 'Panier Premium' },
        ],
      },
    ],
  },
}

const CITIES = ['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès', 'Agadir']

const ClientHeader: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { totalItems, openDrawer } = useCart()
  const { user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [accountAnchor, setAccountAnchor] = useState<null | HTMLElement>(null)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const [activeMegaTab, setActiveMegaTab] = useState('fruits')
  const [deliveryCity, setDeliveryCity] = useState(() => localStorage.getItem('dfl_city') || 'Casablanca')
  const [cityDialogOpen, setCityDialogOpen] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)

  const { data: categories } = useQuery({
    queryKey: ['public-categories'],
    queryFn: () => categoriesApi.list().then((r) => r.data),
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMegaMenuOpen(false)
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMegaMenuOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    setMegaMenuOpen(false)
  }, [location.pathname, location.search])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/produits?q=${encodeURIComponent(searchQuery)}`)
  }

  const handleLogout = async () => {
    setAccountAnchor(null)
    await logout()
  }

  const navCategories = [
    { key: 'promotions', label: 'Promotions', icon: <Tag size={18} />, path: '/produits?promo=true' },
    { key: 'fruits-legumes', label: 'Fruits & Légumes', icon: <Apple size={18} />, hasMega: true, path: '/produits' },
    { key: 'fruits', label: 'Fruits', icon: <Cherry size={18} />, path: '/produits?category=fruits' },
    { key: 'legumes', label: 'Légumes', icon: <Carrot size={18} />, path: '/produits?category=legumes' },
    { key: 'fruits-exotiques', label: 'Fruits Exotiques', icon: <Citrus size={18} />, path: '/produits?category=fruits-exotiques' },
    { key: 'herbes', label: 'Herbes', icon: <Leaf size={18} />, path: '/produits?category=herbes' },
    { key: 'paniers-prets', label: 'Paniers', icon: <ShoppingBasket size={18} />, path: '/produits?category=paniers-prets' },
    { key: 'frais', label: 'Produits Frais', icon: <Sparkles size={18} />, path: '/produits' },
  ]

  const currentTabObj =
    MEGA_MENU_DATA['fruits-legumes'].tabs.find((t) => t.key === activeMegaTab) ||
    MEGA_MENU_DATA['fruits-legumes'].tabs[0]

  return (
    <Box ref={headerRef} sx={{ position: 'sticky', top: 0, zIndex: 1100 }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: COLORS.darkGreen,
          color: 'white',
        }}
      >
        {/* Top Row: Logo | Delivery | Wide Search | Account | Bag */}
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              gap: { xs: 1.5, md: 2.5 },
              py: 1.25,
              minHeight: { xs: 62, md: 68 },
              flexWrap: { xs: 'wrap', md: 'nowrap' },
            }}
          >
            {/* Left: Logo + Vertical Separator + Delivery Selector */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
              <Box
                onClick={() => navigate('/')}
                sx={{
                  bgcolor: 'white',
                  borderRadius: 2,
                  px: 1.25,
                  py: 0.4,
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <Box
                  component="img"
                  src="/logo.png"
                  alt="DFL Fresh"
                  sx={{ height: { xs: 34, md: 40 }, width: 'auto', objectFit: 'contain' }}
                />
              </Box>

              <Box
                sx={{
                  display: { xs: 'none', lg: 'flex' },
                  alignItems: 'center',
                  borderLeft: '1px solid rgba(255,255,255,0.22)',
                  pl: 2,
                  cursor: 'pointer',
                }}
                onClick={() => setCityDialogOpen(true)}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', display: 'block', lineHeight: 1.2, fontSize: '0.72rem' }}>
                    Livraison
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <MapPin size={13} color="#A5D6A7" />
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, fontSize: '0.82rem', textDecoration: 'underline' }}>
                      {deliveryCity}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Center: Wide Pill Search Bar */}
            <Box
              component="form"
              onSubmit={handleSearch}
              sx={{
                flexGrow: 1,
                maxWidth: 640,
                mx: { xs: 0, md: 'auto' },
                order: { xs: 3, md: 2 },
                width: { xs: '100%', md: 'auto' },
                display: 'flex',
                alignItems: 'center',
                bgcolor: COLORS.white,
                borderRadius: 999,
                px: 2,
                height: 42,
              }}
            >
              <Search size={18} color="#4B5563" style={{ flexShrink: 0, marginRight: 10 }} />
              <InputBase
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Que recherchez-vous aujourd'hui ?"
                sx={{ flexGrow: 1, fontSize: '0.9rem', color: '#171717' }}
              />
            </Box>

            {/* Right: Account + Bag */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 }, ml: 'auto', order: { xs: 2, md: 3 }, flexShrink: 0 }}>
              {user ? (
                <>
                  <Box
                    onClick={(e) => setAccountAnchor(e.currentTarget)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      cursor: 'pointer',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1.5,
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                    }}
                  >
                    <UserRound size={19} color="white" />
                    <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', display: 'block', lineHeight: 1.1, fontSize: '0.7rem' }}>
                        Compte
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, fontSize: '0.82rem', lineHeight: 1.2 }}>
                        {user.full_name.split(' ')[0]}
                      </Typography>
                    </Box>
                    <ChevronDown size={14} color="white" />
                  </Box>

                  <Menu
                    anchorEl={accountAnchor}
                    open={Boolean(accountAnchor)}
                    onClose={() => setAccountAnchor(null)}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    PaperProps={{ sx: { minWidth: 220, mt: 1, borderRadius: 2 } }}
                  >
                    <Box sx={{ px: 2, py: 1.25 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                        {user.full_name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: COLORS.textSecondary }} noWrap>
                        {user.email}
                      </Typography>
                    </Box>
                    <Divider />
                    {user.role === 'client' ? (
                      [
                        <MenuItem key="profile" onClick={() => { setAccountAnchor(null); navigate('/profil') }}>
                          <ListItemIcon><UserRound size={16} /></ListItemIcon>
                          Mon Profil
                        </MenuItem>,
                        <MenuItem key="orders" onClick={() => { setAccountAnchor(null); navigate('/mes-commandes') }}>
                          <ListItemIcon><Package size={16} /></ListItemIcon>
                          Mes Commandes
                        </MenuItem>,
                      ]
                    ) : user.role === 'livreur' ? (
                      <MenuItem onClick={() => { setAccountAnchor(null); navigate('/delivery') }}>
                        <ListItemIcon><Truck size={16} /></ListItemIcon>
                        Mes Livraisons
                      </MenuItem>
                    ) : (
                      <MenuItem onClick={() => { setAccountAnchor(null); navigate('/admin') }}>
                        <ListItemIcon><LayoutDashboard size={16} /></ListItemIcon>
                        Tableau de bord
                      </MenuItem>
                    )}
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ color: COLORS.error }}>
                      <ListItemIcon sx={{ color: COLORS.error }}>
                        <LogOut size={16} />
                      </ListItemIcon>
                      Déconnexion
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box
                  onClick={() => navigate('/login')}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1.5,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                  }}
                >
                  <UserRound size={19} color="white" />
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', display: 'block', lineHeight: 1.1, fontSize: '0.7rem' }}>
                      Compte
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, fontSize: '0.8rem', lineHeight: 1.2, textDecoration: 'underline' }}>
                      Se connecter
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Shopping Bag Icon -> Opens Right Cart Drawer */}
              <IconButton
                onClick={openDrawer}
                aria-label="Ouvrir le panier"
                sx={{
                  color: 'white',
                  p: 1,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
                }}
              >
                <Badge
                  badgeContent={totalItems}
                  showZero
                  sx={{
                    '& .MuiBadge-badge': {
                      bgcolor: COLORS.white,
                      color: COLORS.darkGreen,
                      fontWeight: 800,
                      fontSize: '0.68rem',
                      minWidth: 18,
                      height: 18,
                    },
                  }}
                >
                  <ShoppingBag size={22} />
                </Badge>
              </IconButton>
            </Box>
          </Toolbar>
        </Container>

        {/* Bottom Row: Horizontal Category Navigation with Icons */}
        <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.10)' }}>
          <Container maxWidth="xl">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: { xs: 'flex-start', lg: 'center' },
                gap: { xs: 1, md: 2.5 },
                overflowX: 'auto',
                py: 0.75,
                '&::-webkit-scrollbar': { height: 0 },
              }}
            >
              {navCategories.map((cat) => {
                const isMegaActive = cat.hasMega && megaMenuOpen
                return (
                  <Button
                    key={cat.key}
                    onMouseEnter={() => {
                      if (cat.hasMega) setMegaMenuOpen(true)
                    }}
                    onClick={() => {
                      if (cat.hasMega) {
                        setMegaMenuOpen((prev) => !prev)
                      } else {
                        setMegaMenuOpen(false)
                        navigate(cat.path)
                      }
                    }}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.4,
                      px: 1.5,
                      py: 0.75,
                      minWidth: 'max-content',
                      borderRadius: 1.5,
                      color: isMegaActive ? COLORS.darkGreen : 'white',
                      bgcolor: isMegaActive ? COLORS.white : 'transparent',
                      '&:hover': {
                        bgcolor: isMegaActive ? COLORS.white : 'rgba(255,255,255,0.12)',
                      },
                    }}
                  >
                    {cat.icon}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.76rem', color: 'inherit' }}>
                        {cat.label}
                      </Typography>
                      {cat.hasMega && <ChevronDown size={12} />}
                    </Box>
                  </Button>
                )
              })}
            </Box>
          </Container>
        </Box>
      </AppBar>

      {/* Mega Menu Panel (Screenshot 4 style) */}
      {megaMenuOpen && (
        <Box
          onMouseLeave={() => setMegaMenuOpen(false)}
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bgcolor: COLORS.white,
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.14)',
            borderBottom: `1px solid ${COLORS.border}`,
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
            zIndex: 1200,
            py: 3,
          }}
        >
          <Container maxWidth="lg">
            {/* Category Tabs */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 4,
                borderBottom: `1px solid ${COLORS.border}`,
                mb: 3,
              }}
            >
              {MEGA_MENU_DATA['fruits-legumes'].tabs.map((tab) => {
                const active = activeMegaTab === tab.key
                return (
                  <Button
                    key={tab.key}
                    onClick={() => setActiveMegaTab(tab.key)}
                    sx={{
                      pb: 1.25,
                      borderRadius: 0,
                      fontWeight: active ? 700 : 500,
                      color: active ? '#171717' : '#6B7280',
                      borderBottom: active ? `2px solid ${COLORS.primaryGreen}` : '2px solid transparent',
                      '&:hover': { bgcolor: 'transparent', color: COLORS.primaryGreen },
                    }}
                  >
                    {tab.label}
                  </Button>
                )
              })}
            </Box>

            {/* Subcategory Columns */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 2,
                mb: 2.5,
              }}
            >
              {currentTabObj.items.map((sub) => (
                <Typography
                  key={sub.label}
                  variant="body2"
                  onClick={() => {
                    setMegaMenuOpen(false)
                    navigate(`/produits?q=${encodeURIComponent(sub.query)}`)
                  }}
                  sx={{
                    cursor: 'pointer',
                    color: '#171717',
                    fontWeight: 500,
                    py: 0.4,
                    '&:hover': { color: COLORS.primaryGreen, textDecoration: 'underline' },
                  }}
                >
                  {sub.label}
                </Typography>
              ))}
            </Box>

            <Typography
              component="button"
              onClick={() => {
                setMegaMenuOpen(false)
                const matchedCat = (categories || []).find((c: any) => c.slug === currentTabObj.slug)
                navigate(`/produits?category=${matchedCat ? matchedCat.slug : currentTabObj.slug}`)
              }}
              sx={{
                background: 'none',
                border: 'none',
                p: 0,
                cursor: 'pointer',
                color: COLORS.darkGreen,
                fontWeight: 700,
                fontSize: '0.88rem',
                textDecoration: 'underline',
                '&:hover': { color: COLORS.primaryGreen },
              }}
            >
              Voir tout : {currentTabObj.label}
            </Typography>
          </Container>
        </Box>
      )}

      {/* Delivery City Dialog */}
      <Dialog open={cityDialogOpen} onClose={() => setCityDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Choisir votre ville de livraison</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Ville</InputLabel>
            <Select
              value={deliveryCity}
              label="Ville"
              onChange={(e) => {
                setDeliveryCity(e.target.value)
                localStorage.setItem('dfl_city', e.target.value)
              }}
            >
              {CITIES.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="contained" onClick={() => setCityDialogOpen(false)} sx={{ bgcolor: COLORS.primaryGreen }}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ClientHeader
