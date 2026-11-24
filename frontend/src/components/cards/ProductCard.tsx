import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, IconButton, Chip } from '@mui/material'
import { Plus, Bookmark, Leaf, Check } from 'lucide-react'
import { useSnackbar } from 'notistack'
import { Product } from '../../types'
import { COLORS, TRANSITIONS } from '../../theme/theme'
import { API_URL } from '../../services/api'
import { useCart } from '../../contexts/CartContext'

interface Props {
  product: Product
  discountPercent?: number
}

const ProductCard: React.FC<Props> = ({ product, discountPercent }) => {
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { enqueueSnackbar } = useSnackbar()
  const [saved, setSaved] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const isOutOfStock = product.quantity <= 0 || product.stock_status === 'rupture'
  const isLowStock = !isOutOfStock && product.stock_status === 'faible'
  const detailPath = `/products/${product.slug || product.id}`

  const handleOpenDetail = () => {
    navigate(detailPath)
  }

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isOutOfStock) return
    addItem(product, 1)
    setJustAdded(true)
    enqueueSnackbar(`${product.name_fr} ajouté au panier`, { variant: 'success' })
    setTimeout(() => setJustAdded(false), 900)
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSaved((prev) => !prev)
  }

  const originalPrice =
    discountPercent && discountPercent > 0
      ? product.selling_price / (1 - discountPercent / 100)
      : null

  return (
    <Box
      onClick={handleOpenDetail}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: COLORS.white,
        borderRadius: 2.5,
        border: '1px solid #E5E7EB',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: TRANSITIONS.smooth,
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
          borderColor: '#D1D5DB',
          '& .fd-card-img': {
            transform: 'scale(1.04)',
          },
        },
      }}
    >
      {/* Clean Rectangular Image Area with Circular Green + Button */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1 / 1',
          bgcolor: '#F9FAFB',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {product.image_url ? (
          <Box
            component="img"
            className="fd-card-img"
            src={`${API_URL}${product.image_url}`}
            alt={product.name_fr}
            loading="lazy"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
        ) : (
          <Leaf size={44} color={COLORS.primaryGreen} strokeWidth={1.5} />
        )}

        {/* Top-left Status / Promo Badge */}
        {discountPercent && discountPercent > 0 ? (
          <Chip
            label={`-${discountPercent}%`}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              bgcolor: '#B91C1C',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.7rem',
              height: 22,
            }}
          />
        ) : isOutOfStock ? (
          <Chip
            label="Rupture"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              bgcolor: 'rgba(185, 28, 28, 0.92)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.68rem',
              height: 22,
            }}
          />
        ) : isLowStock ? (
          <Chip
            label="Stock limité"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              bgcolor: 'rgba(217, 119, 6, 0.92)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.68rem',
              height: 22,
            }}
          />
        ) : null}

        {/* Top-right Favorite Bookmark Button */}
        <IconButton
          size="small"
          onClick={handleToggleFavorite}
          aria-label="Ajouter aux favoris"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(255, 255, 255, 0.92)',
            border: '1px solid #E5E7EB',
            width: 30,
            height: 30,
            color: saved ? COLORS.primaryGreen : '#4B5563',
            '&:hover': { bgcolor: COLORS.white, color: COLORS.primaryGreen },
          }}
        >
          <Bookmark size={15} fill={saved ? COLORS.primaryGreen : 'none'} />
        </IconButton>

        {/* Bottom-right Circular Green Add Button (FreshDirect style) */}
        <IconButton
          onClick={handleQuickAdd}
          disabled={isOutOfStock}
          aria-label={`Ajouter ${product.name_fr} au panier`}
          sx={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            width: 38,
            height: 38,
            borderRadius: '50%',
            bgcolor: isOutOfStock ? '#9CA3AF' : justAdded ? COLORS.darkGreen : COLORS.primaryGreen,
            color: COLORS.white,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.20)',
            transition: TRANSITIONS.fast,
            '&:hover': {
              bgcolor: isOutOfStock ? '#9CA3AF' : COLORS.darkGreen,
              transform: isOutOfStock ? 'none' : 'scale(1.08)',
            },
          }}
        >
          {justAdded ? <Check size={18} strokeWidth={2.5} /> : <Plus size={20} strokeWidth={2.5} />}
        </IconButton>
      </Box>

      {/* Product Info */}
      <Box sx={{ p: 1.75, display: 'flex', flexDirection: 'column', gap: 0.4, flexGrow: 1 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            color: '#171717',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.7em',
          }}
        >
          {product.name_fr}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, mt: 0.25 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 800,
              color: originalPrice ? '#B91C1C' : '#171717',
              fontSize: '0.98rem',
              lineHeight: 1.2,
            }}
          >
            {product.selling_price.toFixed(2)} DH
          </Typography>
          <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 500 }}>
            / {product.unit}
          </Typography>
          {originalPrice && (
            <Typography variant="caption" sx={{ color: '#9CA3AF', textDecoration: 'line-through', ml: 0.25 }}>
              {originalPrice.toFixed(2)} DH
            </Typography>
          )}
        </Box>

        <Typography
          variant="caption"
          sx={{
            color: isOutOfStock ? '#B91C1C' : isLowStock ? '#D97706' : COLORS.primaryGreen,
            fontWeight: 600,
            fontSize: '0.72rem',
            mt: 'auto',
            pt: 0.5,
          }}
        >
          {isOutOfStock ? 'Indisponible' : isLowStock ? `Plus que ${product.quantity} ${product.unit}` : 'Frais du jour • En stock'}
        </Typography>
      </Box>
    </Box>
  )
}

export default ProductCard
