import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Container, Box, Typography, Grid, Button, IconButton,
  Tabs, Tab, Breadcrumbs, Chip, Skeleton, Divider
} from '@mui/material'
import { Plus, Minus, Bookmark, Truck, ShieldCheck, Leaf, ArrowLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { productsApi, API_URL } from '../../../services/api'
import { useCart } from '../../../contexts/CartContext'
import { COLORS } from '../../../theme/theme'
import { Product } from '../../../types'
import ProductCarousel from '../../../components/products/ProductCarousel'

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { addItem, openDrawer } = useCart()
  const { enqueueSnackbar } = useSnackbar()
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState(0)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setQty(1)
    setTab(0)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [slug])

  const { data: product, isLoading, isError } = useQuery<Product>({
    queryKey: ['product-detail', slug],
    queryFn: () => productsApi.get(slug!).then((r) => r.data),
    enabled: !!slug,
  })

  const { data: relatedData, isLoading: relatedLoading } = useQuery({
    queryKey: ['related-products', product?.category_slug || product?.category_id],
    queryFn: () =>
      productsApi
        .listPublic({
          category_id: product?.category_slug || product?.category_id,
          limit: 12,
        })
        .then((r) => r.data),
    enabled: !!product,
  })

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Skeleton width={260} height={24} sx={{ mb: 4 }} />
        <Grid container spacing={5}>
          <Grid item xs={12} md={6}>
            <Skeleton height={48} width="70%" sx={{ mb: 2 }} />
            <Skeleton height={32} width="40%" sx={{ mb: 3 }} />
            <Skeleton height={160} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rounded" height={420} />
          </Grid>
        </Grid>
      </Container>
    )
  }

  if (isError || !product) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          Produit introuvable
        </Typography>
        <Button startIcon={<ArrowLeft size={18} />} onClick={() => navigate('/produits')} variant="contained" sx={{ bgcolor: COLORS.primaryGreen }}>
          Retour au catalogue
        </Button>
      </Container>
    )
  }

  const isOutOfStock = product.quantity <= 0 || product.stock_status === 'rupture'
  const relatedProducts = (relatedData?.products || []).filter((p: Product) => p.id !== product.id)

  const handleAddToBag = () => {
    if (isOutOfStock) return
    addItem(product, qty)
    enqueueSnackbar(`${qty} × ${product.name_fr} ajouté au panier`, { variant: 'success' })
    openDrawer()
  }

  return (
    <Box sx={{ bgcolor: COLORS.white, pb: 6 }} className="dfl-fade-in">
      <Container maxWidth="lg" sx={{ pt: 3 }}>
        {/* Breadcrumb (Screenshot 1) */}
        <Breadcrumbs sx={{ mb: 3, fontSize: '0.84rem' }}>
          <Link to="/" style={{ color: COLORS.primaryGreen, fontWeight: 500 }}>
            Accueil
          </Link>
          <Link to="/produits" style={{ color: COLORS.primaryGreen, fontWeight: 500 }}>
            Fruits & Légumes
          </Link>
          {product.category_name && (
            <Link
              to={`/produits?category=${product.category_slug || product.category_id}`}
              style={{ color: COLORS.primaryGreen, fontWeight: 500 }}
            >
              {product.category_name}
            </Link>
          )}
          <Typography color="text.primary" sx={{ fontSize: '0.84rem', fontWeight: 600 }}>
            {product.name_fr}
          </Typography>
        </Breadcrumbs>

        {/* Main 2-Column FreshDirect Product Layout */}
        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="flex-start">
          {/* LEFT: Info, Price, Tabs, Add to Bag */}
          <Grid item xs={12} md={6}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#171717', mb: 0.75, fontSize: { xs: '1.75rem', md: '2.15rem' } }}>
              {product.name_fr}
            </Typography>
            {product.name_ar && (
              <Typography variant="body1" sx={{ color: COLORS.textSecondary, mb: 1.5, fontWeight: 500 }}>
                {product.name_ar}
              </Typography>
            )}

            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#171717' }}>
                {product.selling_price.toFixed(2)} DH
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.textSecondary, fontWeight: 500 }}>
                / {product.unit}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={isOutOfStock ? 'Rupture de stock' : product.stock_status === 'faible' ? `Stock limité (${product.quantity} ${product.unit})` : 'En stock'}
                  size="small"
                  color={isOutOfStock ? 'error' : product.stock_status === 'faible' ? 'warning' : 'success'}
                />
                <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 500 }}>
                  • Fraîcheur garantie
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#171717' }}>
                <Truck size={16} color={COLORS.primaryGreen} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Livraison rapide disponible (Paiement à la livraison)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#171717' }}>
                <ShieldCheck size={16} color={COLORS.primaryGreen} />
                <Typography variant="body2" sx={{ textDecoration: 'underline', fontWeight: 500 }}>
                  Qualité sélectionnée DFL Fresh
                </Typography>
              </Box>
            </Box>

            <Button
              variant="text"
              startIcon={<Bookmark size={16} fill={saved ? COLORS.primaryGreen : 'none'} />}
              onClick={() => setSaved((s) => !s)}
              sx={{ color: saved ? COLORS.primaryGreen : '#171717', px: 0, mb: 2, fontWeight: 600 }}
            >
              {saved ? 'Enregistré dans vos favoris' : 'Ajouter aux favoris'}
            </Button>

            {/* Tabs: Description / Informations */}
            <Box sx={{ borderBottom: `1px solid ${COLORS.border}`, mb: 2 }}>
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                sx={{
                  '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minWidth: 100, px: 0, mr: 3 },
                  '& .Mui-selected': { color: `${COLORS.primaryGreen} !important` },
                  '& .MuiTabs-indicator': { backgroundColor: COLORS.primaryGreen },
                }}
              >
                <Tab label="Description" />
                <Tab label="Informations" />
              </Tabs>
            </Box>

            {tab === 0 ? (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.75, mb: 1.5 }}>
                  {product.description || 'Produit frais sélectionné quotidiennement auprès de nos producteurs partenaires.'}
                </Typography>
                {product.description_ar && (
                  <Typography variant="body2" sx={{ color: COLORS.textSecondary, lineHeight: 1.75 }}>
                    {product.description_ar}
                  </Typography>
                )}
              </Box>
            ) : (
              <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2"><strong>Catégorie :</strong> {product.category_name || 'Fruits & Légumes'}</Typography>
                <Typography variant="body2"><strong>Unité de vente :</strong> {product.unit}</Typography>
                <Typography variant="body2"><strong>Disponibilité :</strong> {isOutOfStock ? 'Rupture' : `${product.quantity} ${product.unit}`}</Typography>
                <Typography variant="body2"><strong>Conservation :</strong> À conserver dans un endroit frais et sec ou au réfrigérateur.</Typography>
              </Box>
            )}

            <Divider sx={{ mb: 3 }} />

            {/* Action Bar: Quantity Stepper + Add to Bag + Total (Screenshot 1 & 3) */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 999,
                  height: 44,
                  px: 1,
                }}
              >
                <IconButton
                  size="small"
                  disabled={isOutOfStock || qty <= 1}
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Diminuer"
                >
                  <Minus size={16} />
                </IconButton>
                <Typography sx={{ px: 2, fontWeight: 700, minWidth: 32, textAlign: 'center' }}>
                  {qty}
                </Typography>
                <IconButton
                  size="small"
                  disabled={isOutOfStock}
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Augmenter"
                >
                  <Plus size={16} />
                </IconButton>
              </Box>

              <Button
                variant="contained"
                size="large"
                disabled={isOutOfStock}
                onClick={handleAddToBag}
                sx={{
                  bgcolor: COLORS.primaryGreen,
                  color: 'white',
                  borderRadius: 999,
                  px: 4,
                  height: 44,
                  fontWeight: 700,
                  '&:hover': { bgcolor: COLORS.darkGreen },
                }}
              >
                {isOutOfStock ? 'Indisponible' : 'Ajouter au panier'}
              </Button>

              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#171717' }}>
                Total {(product.selling_price * qty).toFixed(2)} DH
              </Typography>
            </Box>
          </Grid>

          {/* RIGHT: Large Centered Product Photograph */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                width: '100%',
                aspectRatio: '1 / 1',
                maxHeight: 460,
                bgcolor: '#F9FAFB',
                borderRadius: 3,
                border: `1px solid ${COLORS.border}`,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
              }}
            >
              {product.image_url ? (
                <Box
                  component="img"
                  src={`${API_URL}${product.image_url}`}
                  alt={product.name_fr}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <Leaf size={64} color={COLORS.primaryGreen} />
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Related Products Carousel (Screenshot 2 & 4) */}
        <Divider sx={{ my: 5 }} />
        <ProductCarousel
          title="Vous aimerez aussi"
          products={relatedProducts}
          isLoading={relatedLoading}
          seeAllPath={`/produits?category=${product.category_slug || ''}`}
        />
      </Container>
    </Box>
  )
}

export default ProductDetailPage

