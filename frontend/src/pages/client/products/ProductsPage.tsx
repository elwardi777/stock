import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Box, Container, Grid, Typography, TextField, InputAdornment,
  MenuItem, Select, FormControl, InputLabel, Chip, Skeleton, Alert
} from '@mui/material'
import { Search, SlidersHorizontal, Package, Tag } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { productsApi, categoriesApi, promotionsApi } from '../../../services/api'
import { COLORS } from '../../../theme/theme'
import { Product } from '../../../types'
import ProductCard from '../../../components/cards/ProductCard'

const ProductsPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [sortBy, setSortBy] = useState('default')
  const [stockOnly, setStockOnly] = useState('all')

  useEffect(() => {
    setSearch(searchParams.get('q') || '')
    setCategory(searchParams.get('category') || '')
  }, [searchParams])

  const isPromoView = searchParams.get('promo') === 'true'

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list().then((r) => r.data),
  })

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['catalogue-products', search, category],
    queryFn: () => productsApi.list({ search: search || undefined, is_visible: true, limit: 100 }).then((r) => r.data),
  })

  const { data: activePromos } = useQuery({
    queryKey: ['public-active-promos'],
    queryFn: () => promotionsApi.activePublic().then((r) => r.data),
  })

  const topPromo = (activePromos || [])[0]
  const promoDiscount = isPromoView && topPromo?.type === 'percentage' ? Number(topPromo.value) : undefined

  const filteredProducts = useMemo(() => {
    let list: Product[] = productsData?.products || []

    if (category) {
      const matchedCat = (categories || []).find((c: any) => c.slug === category || c.id === category)
      if (matchedCat) {
        list = list.filter((p) => p.category_id === matchedCat.id)
      }
    }

    if (stockOnly === 'in_stock') {
      list = list.filter((p) => p.quantity > 0)
    } else if (stockOnly === 'low') {
      list = list.filter((p) => p.stock_status === 'faible')
    }

    if (sortBy === 'price_asc') {
      list = [...list].sort((a, b) => a.selling_price - b.selling_price)
    } else if (sortBy === 'price_desc') {
      list = [...list].sort((a, b) => b.selling_price - a.selling_price)
    } else if (sortBy === 'name') {
      list = [...list].sort((a, b) => a.name_fr.localeCompare(b.name_fr))
    }

    return list
  }, [productsData, categories, category, stockOnly, sortBy])

  return (
    <Box sx={{ bgcolor: COLORS.white, minHeight: '70vh', py: 4 }} className="dfl-fade-in">
      <Container maxWidth="xl">
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#171717' }}>
            {isPromoView ? 'Promotions & Offres Fraîcheur' : 'Catalogue Fruits & Légumes'}
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.textSecondary, mt: 0.5 }}>
            {filteredProducts.length} produits trouvés
          </Typography>
        </Box>

        {isPromoView && topPromo && (
          <Alert icon={<Tag size={18} />} severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            <strong>{topPromo.title}</strong> — {topPromo.description || `Profitez de -${topPromo.value}${topPromo.type === 'percentage' ? '%' : ' DH'} sur nos produits frais.`}
          </Alert>
        )}

        {/* Filter Bar */}
        <Box
          sx={{
            p: 2,
            mb: 3,
            bgcolor: '#F9FAFB',
            borderRadius: 2.5,
            border: `1px solid ${COLORS.border}`,
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <TextField
            size="small"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} color={COLORS.textSecondary} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: { xs: '100%', sm: 240 }, bgcolor: COLORS.white }}
          />

          <FormControl size="small" sx={{ minWidth: 180, bgcolor: COLORS.white }}>
            <InputLabel>Disponibilité</InputLabel>
            <Select value={stockOnly} onChange={(e) => setStockOnly(e.target.value)} label="Disponibilité">
              <MenuItem value="all">Tous les produits</MenuItem>
              <MenuItem value="in_stock">En stock uniquement</MenuItem>
              <MenuItem value="low">Stock limité</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 180, bgcolor: COLORS.white }}>
            <InputLabel>Trier par</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Trier par"
              startAdornment={<SlidersHorizontal size={14} style={{ marginRight: 8, color: COLORS.textSecondary }} />}
            >
              <MenuItem value="default">Pertinence</MenuItem>
              <MenuItem value="price_asc">Prix croissant</MenuItem>
              <MenuItem value="price_desc">Prix décroissant</MenuItem>
              <MenuItem value="name">Nom (A-Z)</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', ml: { lg: 'auto' } }}>
            <Chip
              label="Tous"
              clickable
              color={!category ? 'primary' : 'default'}
              variant={!category ? 'filled' : 'outlined'}
              onClick={() => setCategory('')}
            />
            {(categories || []).map((cat: any) => (
              <Chip
                key={cat.id}
                label={cat.name}
                clickable
                color={category === cat.slug ? 'primary' : 'default'}
                variant={category === cat.slug ? 'filled' : 'outlined'}
                onClick={() => setCategory(cat.slug)}
              />
            ))}
          </Box>
        </Box>

        {/* Product Grid */}
        <Grid container spacing={2}>
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => (
                <Grid item xs={6} sm={4} md={3} lg={2.4} key={i}>
                  <Skeleton variant="rounded" height={295} sx={{ borderRadius: 2.5 }} />
                </Grid>
              ))
            : filteredProducts.map((product: Product) => (
                <Grid item xs={6} sm={4} md={3} lg={2.4} key={product.id}>
                  <ProductCard product={product} discountPercent={promoDiscount} />
                </Grid>
              ))}

          {!isLoading && filteredProducts.length === 0 && (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 8, color: COLORS.textSecondary }}>
                <Package size={48} strokeWidth={1.5} style={{ margin: '0 auto 12px' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Aucun produit trouvé
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  Essayez de modifier vos filtres ou votre recherche.
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  )
}

export default ProductsPage
