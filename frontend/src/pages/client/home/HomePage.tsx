import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Grid, Button, Container, Chip, Skeleton, Divider
} from '@mui/material'
import { Leaf, Truck, CreditCard, ShieldCheck, ArrowRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { productsApi, categoriesApi, promotionsApi, API_URL } from '../../../services/api'
import { COLORS } from '../../../theme/theme'
import { Product } from '../../../types'
import ProductCarousel from '../../../components/products/ProductCarousel'

const CATEGORY_PHOTOS: Record<string, string> = {
  legumes: '/uploads/products/tomates-rondes.jpg',
  fruits: '/uploads/products/pommes-rouges.jpg',
  'fruits-exotiques': '/uploads/products/mangues.jpg',
  herbes: '/uploads/products/menthe-fraiche.jpg',
  'paniers-prets': '/uploads/products/panier-familial.jpg',
}

const HomePage: React.FC = () => {
  const navigate = useNavigate()

  const { data: categoriesData, isLoading: catsLoading } = useQuery({
    queryKey: ['public-categories'],
    queryFn: () => categoriesApi.list().then((r) => r.data),
  })

  const { data: productsData, isLoading: prodsLoading } = useQuery({
    queryKey: ['public-products-all-home'],
    queryFn: () => productsApi.listPublic({ limit: 50 }).then((r) => r.data),
  })

  const { data: activePromos } = useQuery({
    queryKey: ['public-active-promos'],
    queryFn: () => promotionsApi.activePublic().then((r) => r.data),
  })

  const allProducts: Product[] = productsData?.products || []
  const categories = categoriesData || []

  const getProductsByCatSlug = (slug: string) => {
    const cat = categories.find((c: any) => c.slug === slug)
    if (!cat) return []
    return allProducts.filter((p) => p.category_id === cat.id)
  }

  const fruitsProducts = getProductsByCatSlug('fruits')
  const legumesProducts = getProductsByCatSlug('legumes')
  const exoticAndBaskets = [
    ...getProductsByCatSlug('fruits-exotiques'),
    ...getProductsByCatSlug('paniers-prets'),
    ...getProductsByCatSlug('herbes'),
  ]

  const topPromo = (activePromos || [])[0]
  const promoDiscount = topPromo?.type === 'percentage' ? Number(topPromo.value) : undefined

  return (
    <Box sx={{ bgcolor: COLORS.white }} className="dfl-fade-in">
      {/* Compact Commercial Promotional Banner */}
      <Container maxWidth="xl" sx={{ pt: 3, pb: 2 }}>
        <Box
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            border: `1px solid ${COLORS.border}`,
            bgcolor: '#F4F8F4',
          }}
        >
          <Grid container alignItems="center">
            <Grid item xs={12} md={6} sx={{ p: { xs: 3, md: 5 } }}>
              <Chip
                icon={<Leaf size={14} color={COLORS.primaryGreen} />}
                label={topPromo ? `Offre : ${topPromo.title}` : 'Sélection Fraîcheur du Jour'}
                size="small"
                sx={{
                  bgcolor: COLORS.lightGreen,
                  color: COLORS.darkGreen,
                  fontWeight: 700,
                  mb: 2,
                }}
              />
              <Typography
                variant="h2"
                sx={{
                  color: '#171717',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  mb: 1.5,
                  fontSize: { xs: '1.65rem', md: '2.35rem' },
                }}
              >
                Vos Fruits & Légumes Frais,{' '}
                <Box component="span" sx={{ color: COLORS.primaryGreen }}>
                  Toute l'Année !
                </Box>
              </Typography>
              <Typography variant="body1" sx={{ color: '#4B5563', mb: 3, maxWidth: 460, lineHeight: 1.65 }}>
                Récoltés et sélectionnés chaque matin pour votre cuisine. Livraison rapide à domicile et paiement à la réception.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowRight size={18} />}
                  onClick={() => navigate('/produits')}
                  sx={{
                    bgcolor: COLORS.primaryGreen,
                    borderRadius: 999,
                    px: 3.5,
                    fontWeight: 700,
                    '&:hover': { bgcolor: COLORS.darkGreen },
                  }}
                >
                  Découvrir le catalogue
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/produits?category=paniers-prets')}
                  sx={{
                    borderColor: COLORS.darkGreen,
                    color: COLORS.darkGreen,
                    borderRadius: 999,
                    px: 3,
                    fontWeight: 700,
                    '&:hover': { bgcolor: COLORS.lightGreen, borderColor: COLORS.darkGreen },
                  }}
                >
                  Voir les paniers
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ height: { xs: 220, md: 320 }, width: '100%', overflow: 'hidden' }}>
                <Box
                  component="img"
                  src={`${API_URL}/uploads/hero-produce.jpg`}
                  alt="Fruits et légumes frais DFL Fresh"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Featured Categories */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#171717', mb: 2.5, fontSize: { xs: '1.15rem', md: '1.35rem' } }}>
          Explorer par catégorie
        </Typography>
        <Grid container spacing={2}>
          {catsLoading
            ? Array.from({ length: 5 }).map((_, idx) => (
                <Grid item xs={6} sm={4} md={2.4} key={idx}>
                  <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2.5 }} />
                </Grid>
              ))
            : categories.map((cat: any) => {
                const catImg = CATEGORY_PHOTOS[cat.slug] || '/uploads/products/panier-familial.jpg'
                return (
                  <Grid item xs={6} sm={4} md={2.4} key={cat.id}>
                    <Box
                      onClick={() => navigate(`/produits?category=${cat.slug}`)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: 2.5,
                        border: '1px solid #E5E7EB',
                        bgcolor: COLORS.white,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: COLORS.primaryGreen,
                          bgcolor: '#F9FAFB',
                          boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src={`${API_URL}${catImg}`}
                        alt={cat.name}
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          flexShrink: 0,
                          border: `1px solid ${COLORS.border}`,
                        }}
                      />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#171717' }} noWrap>
                          {cat.name}
                        </Typography>
                        {cat.name_ar && (
                          <Typography variant="caption" sx={{ color: COLORS.textSecondary }} noWrap>
                            {cat.name_ar}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                )
              })}
        </Grid>
      </Container>

      <Container maxWidth="xl">
        <Divider />

        {/* Carousel 1: Offres Fraîcheur / Produits du jour */}
        <ProductCarousel
          title="Offres Fraîcheur : Les produits du jour"
          products={allProducts.slice(0, 10)}
          isLoading={prodsLoading}
          seeAllPath="/produits"
          discountPercent={promoDiscount}
        />

        <Divider />

        {/* Carousel 2: Fruits Frais */}
        <ProductCarousel
          title="Fruits Frais de Saison"
          products={fruitsProducts}
          isLoading={prodsLoading}
          seeAllPath="/produits?category=fruits"
        />

        <Divider />

        {/* Carousel 3: Légumes Frais */}
        <ProductCarousel
          title="Légumes du Marché"
          products={legumesProducts}
          isLoading={prodsLoading}
          seeAllPath="/produits?category=legumes"
        />

        <Divider />

        {/* Carousel 4: Fruits Exotiques, Herbes & Paniers */}
        <ProductCarousel
          title="Fruits Exotiques, Herbes & Paniers Prêts"
          products={exoticAndBaskets}
          isLoading={prodsLoading}
          seeAllPath="/produits?category=paniers-prets"
        />
      </Container>

      {/* Why Choose DFL Fresh */}
      <Box sx={{ bgcolor: '#F9FAFB', borderTop: `1px solid ${COLORS.border}`, py: 5, mt: 3 }}>
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            {[
              { icon: <Leaf size={22} />, title: 'Fraîcheur du matin', desc: 'Sélection quotidienne auprès de nos producteurs.' },
              { icon: <Truck size={22} />, title: 'Livraison Express 24h', desc: 'Créneaux flexibles directement chez vous.' },
              { icon: <CreditCard size={22} />, title: 'Paiement à la livraison', desc: 'Réglez en espèces à la réception.' },
              { icon: <ShieldCheck size={22} />, title: 'Qualité contrôlée', desc: 'Satisfaction garantie sur chaque commande.' },
            ].map((item, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.75 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: COLORS.lightGreen,
                      color: COLORS.primaryGreen,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#171717' }}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: COLORS.textSecondary, lineHeight: 1.5, display: 'block' }}>
                      {item.desc}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  )
}

export default HomePage
