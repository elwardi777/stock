import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Drawer, Box, Typography, IconButton, Button, Divider, Avatar
} from '@mui/material'
import { X, Plus, Minus, Trash2, ShoppingBag, Leaf, ArrowRight } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { COLORS } from '../../theme/theme'
import { API_URL } from '../../services/api'

const CartDrawer: React.FC = () => {
  const navigate = useNavigate()
  const { items, totalItems, totalPrice, drawerOpen, closeDrawer, updateQuantity, removeItem, clearCart } = useCart()
  const { user } = useAuth()

  const deliveryFee = totalPrice >= 200 || totalPrice === 0 ? 0 : 15
  const grandTotal = totalPrice + deliveryFee

  const handleCheckout = () => {
    closeDrawer()
    if (!user) {
      navigate('/login')
    } else {
      navigate('/commande')
    }
  }

  return (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={closeDrawer}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 440 },
          maxWidth: '100vw',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: COLORS.white,
          borderRadius: 0,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#171717' }}>
            Votre panier
          </Typography>
          <Typography variant="body1" sx={{ color: COLORS.textSecondary, fontWeight: 500 }}>
            ({totalItems})
          </Typography>
        </Box>
        <IconButton onClick={closeDrawer} aria-label="Fermer le panier" sx={{ color: '#171717' }}>
          <X size={22} />
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 3, py: 2 }}>
        {items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                bgcolor: COLORS.lightGreen,
                color: COLORS.primaryGreen,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <ShoppingBag size={32} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.75, color: '#171717' }}>
              Votre panier est vide
            </Typography>
            <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 3 }}>
              Ajoutez des fruits et légumes frais pour commencer vos achats.
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                closeDrawer()
                navigate('/produits')
              }}
              sx={{ bgcolor: COLORS.primaryGreen, borderRadius: 999, px: 3, '&:hover': { bgcolor: COLORS.darkGreen } }}
            >
              Découvrir le catalogue
            </Button>
          </Box>
        ) : (
          <>
            {items.map((item) => {
              const slugOrId = item.product.slug || item.product.id
              return (
                <Box
                  key={item.product.id}
                  sx={{
                    py: 2,
                    borderBottom: `1px solid ${COLORS.border}`,
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-start',
                  }}
                >
                  <Avatar
                    src={item.product.image_url ? `${API_URL}${item.product.image_url}` : undefined}
                    variant="rounded"
                    onClick={() => {
                      closeDrawer()
                      navigate(`/products/${slugOrId}`)
                    }}
                    sx={{
                      width: 68,
                      height: 68,
                      bgcolor: '#F9FAFB',
                      border: `1px solid ${COLORS.border}`,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <Leaf size={24} color={COLORS.primaryGreen} />
                  </Avatar>

                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                      <Typography
                        variant="subtitle2"
                        onClick={() => {
                          closeDrawer()
                          navigate(`/products/${slugOrId}`)
                        }}
                        sx={{
                          fontWeight: 700,
                          color: '#171717',
                          cursor: 'pointer',
                          '&:hover': { color: COLORS.primaryGreen, textDecoration: 'underline' },
                        }}
                      >
                        {item.product.name_fr}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#171717', whiteSpace: 'nowrap' }}>
                        {(item.product.selling_price * item.quantity).toFixed(2)} DH
                      </Typography>
                    </Box>

                    <Typography variant="caption" sx={{ color: COLORS.textSecondary, display: 'block', mb: 1.5 }}>
                      {item.product.selling_price.toFixed(2)} DH / {item.product.unit}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => removeItem(item.product.id)}
                          aria-label="Retirer"
                          sx={{
                            border: `1px solid ${COLORS.border}`,
                            width: 30,
                            height: 30,
                            color: COLORS.textSecondary,
                            '&:hover': { color: COLORS.error, borderColor: COLORS.error },
                          }}
                        >
                          <Trash2 size={14} />
                        </IconButton>

                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: 999,
                            height: 30,
                            px: 0.5,
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            sx={{ p: 0.5, color: '#171717' }}
                            aria-label="Diminuer"
                          >
                            <Minus size={13} />
                          </IconButton>
                          <Typography variant="body2" sx={{ px: 1.25, fontWeight: 700, fontSize: '0.82rem' }}>
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            sx={{ p: 0.5, color: '#171717' }}
                            aria-label="Augmenter"
                          >
                            <Plus size={13} />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )
            })}

            <Box sx={{ pt: 2 }}>
              <Button
                variant="text"
                size="small"
                onClick={clearCart}
                sx={{
                  color: '#171717',
                  textDecoration: 'underline',
                  fontWeight: 600,
                  p: 0,
                  '&:hover': { bgcolor: 'transparent', color: COLORS.error, textDecoration: 'underline' },
                }}
              >
                Vider le panier
              </Button>
            </Box>
          </>
        )}
      </Box>

      {/* Fixed Footer */}
      {items.length > 0 && (
        <Box
          sx={{
            px: 3,
            py: 2.5,
            borderTop: `1px solid ${COLORS.border}`,
            bgcolor: COLORS.white,
            boxShadow: '0 -4px 16px rgba(0,0,0,0.04)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
              Sous-total
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#171717' }}>
              {totalPrice.toFixed(2)} DH
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.25 }}>
            <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
              Frais de livraison
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: deliveryFee === 0 ? COLORS.primaryGreen : '#171717' }}>
              {deliveryFee === 0 ? 'Gratuite' : `${deliveryFee.toFixed(2)} DH`}
            </Typography>
          </Box>
          <Divider sx={{ mb: 1.5 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#171717' }}>
              Total estimé
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#171717' }}>
              {grandTotal.toFixed(2)} DH
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleCheckout}
            endIcon={<ArrowRight size={18} />}
            sx={{
              bgcolor: COLORS.primaryGreen,
              color: 'white',
              borderRadius: 999,
              py: 1.4,
              fontWeight: 700,
              fontSize: '0.95rem',
              '&:hover': { bgcolor: COLORS.darkGreen },
            }}
          >
            Passer la commande
          </Button>
        </Box>
      )}
    </Drawer>
  )
}

export default CartDrawer

