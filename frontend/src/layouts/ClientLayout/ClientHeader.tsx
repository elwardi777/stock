import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  Menu, MenuItem, ListItemIcon, Divider, Typography, Box,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, FormControl, InputLabel
} from '@mui/material'
import {
  Search, ShoppingBag, UserRound, LogOut, ChevronDown, ChevronRight,
  Package, LayoutDashboard, Truck, Tag, Apple, Cherry,
  Carrot, Citrus, Leaf, ShoppingBasket, Sparkles, MapPin, ArrowRight
} from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { COLORS } from '../../theme/theme'

const MEGA_CATS = [
  { slug: 'fruits', name: 'Fruits', image: '/store-assets/fruits.webp' },
  { slug: 'legumes', name: 'Légumes', image: '/store-assets/legumes.webp' },
  { slug: 'fruits-exotiques', name: 'Fruits Exotiques', image: '/store-assets/exotiques.webp' },
  { slug: 'herbes', name: 'Herbes', image: '/store-assets/herbes.webp' },
  { slug: 'paniers-prets', name: 'Paniers Prêts', image: '/store-assets/paniers.webp' },
]

const CITIES = ['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès', 'Agadir']

const ClientHeader: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { totalItems, totalPrice, openDrawer } = useCart()
  const { user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [menuKey, setMenuKey] = useState<string | null>(null)
  const [accountAnchor, setAccountAnchor] = useState<null | HTMLElement>(null)
  const [deliveryCity, setDeliveryCity] = useState(() => localStorage.getItem('dfl_city') || 'Casablanca')
  const [cityDialogOpen, setCityDialogOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const outside = (event: MouseEvent) => {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) {
        setMenuKey(null)
      }
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuKey(null)
    }
    document.addEventListener('mousedown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('mousedown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [])

  useEffect(() => {
    setMenuKey(null)
  }, [location.pathname, location.search])

  const navItems = [
    { name: 'Promotions', icon: Tag, slug: 'promotions' },
    { name: 'Fruits & Légumes', icon: Sparkles, slug: 'tous' },
    { name: 'Fruits', icon: Apple, slug: 'fruits' },
    { name: 'Légumes', icon: Carrot, slug: 'legumes' },
    { name: 'Fruits Exotiques', icon: Citrus, slug: 'fruits-exotiques' },
    { name: 'Herbes', icon: Leaf, slug: 'herbes' },
    { name: 'Paniers', icon: ShoppingBasket, slug: 'paniers-prets' },
    { name: 'Produits Frais', icon: Cherry, slug: 'frais' },
  ]

  const selectedMega = MEGA_CATS.find((c) => c.slug === menuKey) || MEGA_CATS[0]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setMenuKey(null)
    navigate(`/produits?q=${encodeURIComponent(searchQuery)}`)
  }

  const handleLogout = async () => {
    setAccountAnchor(null)
    await logout()
  }

  return (
    <>
      <div className="announcement">
        <Truck size={14} />
        <span>La fraîcheur au quotidien, livrée à votre porte (gratuite dès 200 DH).</span>
        <Link to="/produits">Découvrez notre sélection →</Link>
      </div>

      <header className="site-header">
        <div className="shell header-main">
          <div className="sf-brand" onClick={() => navigate('/')} aria-label="DFL Fresh — Accueil">
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: 2,
                px: 1.25,
                py: 0.35,
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <Box
                component="img"
                src="/logo.png"
                alt="DFL Fresh"
                sx={{ height: { xs: 34, md: 40 }, width: 'auto', objectFit: 'contain' }}
              />
            </Box>
          </div>

          <button type="button" className="delivery-button" onClick={() => setCityDialogOpen(true)}>
            <MapPin size={20} />
            <div>
              <small>Votre livraison</small>
              <strong>
                {deliveryCity} <ChevronDown size={12} />
              </strong>
            </div>
          </button>

          <form className="search-form" role="search" onSubmit={handleSearch}>
            <input
              aria-label="Rechercher des produits"
              placeholder="Que recherchez-vous aujourd'hui ?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-submit" aria-label="Rechercher">
              <Search size={18} />
            </button>
          </form>

          <div className="header-actions">
            {user ? (
              <>
                <button
                  type="button"
                  className="account-button"
                  onClick={(e) => setAccountAnchor(e.currentTarget)}
                >
                  <UserRound size={22} strokeWidth={1.6} />
                  <div>
                    <small>Bienvenue</small>
                    <strong>{user.full_name.split(' ')[0]}</strong>
                  </div>
                  <ChevronDown size={14} />
                </button>

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
              <Link to="/login" className="account-button">
                <UserRound size={22} strokeWidth={1.6} />
                <div>
                  <small>Bienvenue chez DFL Fresh</small>
                  <strong>Se connecter</strong>
                </div>
              </Link>
            )}

            <button
              type="button"
              className="bag-button"
              onClick={openDrawer}
              aria-label={`Votre panier, ${totalItems} articles`}
            >
              <ShoppingBag size={22} strokeWidth={1.6} />
              <span className="cart-badge">{totalItems}</span>
              <span className="bag-label">{totalPrice.toFixed(0)} DH</span>
            </button>
          </div>
        </div>

        <div className="nav-band" ref={menuRef} onMouseLeave={() => setMenuKey(null)}>
          <nav className="shell nav-items" aria-label="Rayons">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.slug}
                  type="button"
                  className="nav-item"
                  data-active={menuKey === item.slug}
                  aria-expanded={menuKey === item.slug}
                  onMouseEnter={() => setMenuKey(item.slug === 'promotions' ? null : item.slug)}
                  onClick={() => {
                    if (item.slug === 'promotions') {
                      navigate('/produits?promo=true')
                    } else if (item.slug === 'tous' || item.slug === 'frais') {
                      navigate('/produits')
                    } else {
                      navigate(`/produits?category=${item.slug}`)
                    }
                    setMenuKey(null)
                  }}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                  {item.slug !== 'promotions' && <ChevronDown size={12} />}
                </button>
              )
            })}
          </nav>

          {menuKey && (
            <div className="mega-menu">
              <div className="shell mega-inner">
                <div>
                  <h2 className="mega-title">{selectedMega.name}</h2>
                  <Link
                    className="see-all"
                    to={menuKey === 'tous' || menuKey === 'frais' ? '/produits' : `/produits?category=${selectedMega.slug}`}
                    onClick={() => setMenuKey(null)}
                  >
                    Tout le rayon <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="mega-links">
                  {MEGA_CATS.map((category) => (
                    <Link
                      key={category.slug}
                      to={`/produits?category=${category.slug}`}
                      onClick={() => setMenuKey(null)}
                    >
                      {category.name}
                      <ChevronRight size={12} />
                    </Link>
                  ))}
                </div>
                <img src={selectedMega.image} alt={selectedMega.name} className="mega-photo" />
              </div>
            </div>
          )}
        </div>
      </header>

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
    </>
  )
}

export default ClientHeader
