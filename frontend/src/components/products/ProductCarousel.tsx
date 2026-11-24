import React, { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, IconButton, Skeleton } from '@mui/material'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Product } from '../../types'
import ProductCard from '../cards/ProductCard'

interface Props {
  title: string
  products: Product[]
  seeAllPath?: string
  isLoading?: boolean
  discountPercent?: number
}

const ProductCarousel: React.FC<Props> = ({
  title,
  products,
  seeAllPath,
  isLoading = false,
  discountPercent,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = direction === 'left' ? -520 : 520
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' })
  }

  if (!isLoading && products.length === 0) return null

  return (
    <Box sx={{ py: 3 }}>
      {/* Header Row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.25, gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#171717', fontSize: { xs: '1.15rem', md: '1.35rem' } }}>
            {title}
          </Typography>
          {seeAllPath && (
            <Typography
              component="button"
              onClick={() => navigate(seeAllPath)}
              sx={{
                background: 'none',
                border: 'none',
                p: 0,
                cursor: 'pointer',
                color: '#17472D',
                fontWeight: 600,
                fontSize: '0.88rem',
                textDecoration: 'underline',
                '&:hover': { color: '#238B32' },
              }}
            >
              Voir tout
            </Typography>
          )}
        </Box>

        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 0.75 }}>
          <IconButton
            size="small"
            onClick={() => scroll('left')}
            aria-label="Précédent"
            sx={{
              border: '1px solid #E5E7EB',
              bgcolor: '#FFFFFF',
              color: '#171717',
              '&:hover': { bgcolor: '#F3F4F6' },
            }}
          >
            <ChevronLeft size={18} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => scroll('right')}
            aria-label="Suivant"
            sx={{
              border: '1px solid #E5E7EB',
              bgcolor: '#FFFFFF',
              color: '#171717',
              '&:hover': { bgcolor: '#F3F4F6' },
            }}
          >
            <ChevronRight size={18} />
          </IconButton>
        </Box>
      </Box>

      {/* Horizontal Scroll Track */}
      <Box
        ref={scrollRef}
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          scrollSnapType: 'x proximity',
          pb: 1,
          '&::-webkit-scrollbar': { height: 5 },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#D1D5DB', borderRadius: 3 },
        }}
      >
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Box key={i} sx={{ minWidth: { xs: 175, sm: 210 }, flexShrink: 0 }}>
                <Skeleton variant="rounded" height={295} sx={{ borderRadius: 2.5 }} />
              </Box>
            ))
          : products.map((product) => (
              <Box
                key={product.id}
                sx={{
                  width: { xs: 175, sm: 210, md: 218 },
                  minWidth: { xs: 175, sm: 210, md: 218 },
                  flexShrink: 0,
                  scrollSnapAlign: 'start',
                }}
              >
                <ProductCard product={product} discountPercent={discountPercent} />
              </Box>
            ))}
      </Box>
    </Box>
  )
}

export default ProductCarousel

