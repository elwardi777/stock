import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container, Box, Typography, Card, CardContent, Grid,
  IconButton, Button, Divider, Avatar
} from '@mui/material'
import { Trash2, ShoppingBag, Plus, Minus, Leaf, ArrowRight } from 'lucide-react'
import { useCart } from '../../../contexts/CartContext'
import { COLORS } from '../../../theme/theme'
import { API_URL } from '../../../services/api'

const CartPage: React.FC = () => {
  const navigate = useNavigate()
  const { items, removeItem, updateQuantity, totalPrice } = useCart()

  if (items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }} className="dfl-fade-in">
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: COLORS.lightGreen,
            color: COLORS.primaryGreen,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2.5,
          }}
        >
          <ShoppingBag size={36} />
        </Box>
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 700, color: COLORS.textPrimary }}>
          Votre panier est vide
        </Typography>
        <Typography variant="body1" sx={{ color: COLORS.textSecondary, mb: 3 }}>
          Ajoutez des fruits et légumes frais pour commencer vos achats
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/produits')}
          endIcon={<ArrowRight size={18} />}
          sx={{ bgcolor: COLORS.primaryGreen, '&:hover': { bgcolor: COLORS.darkGreen } }}
        >
          Découvrir le catalogue
        </Button>
      </Container>
    )
  }

  const deliveryFee = totalPrice >= 200 ? 0 : 15

  return (
    <Container maxWidth="lg" sx={{ py: 4 }} className="dfl-fade-in">
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: COLORS.textPrimary }}>
        Mon Panier
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {items.map((item) => (
            <Card key={item.product.id} sx={{ mb: 2 }}>
              <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                <Avatar
                  src={item.product.image_url ? `${API_URL}${item.product.image_url}` : undefined}
                  variant="rounded"
                  sx={{ width: 72, height: 72, bgcolor: COLORS.lightGreen, color: COLORS.primaryGreen }}
                >
                  <Leaf size={28} />
                </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 140 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {item.product.name_fr}
                  </Typography>
                  <Typography variant="body2" sx={{ color: COLORS.primaryGreen, fontWeight: 600 }}>
                    {item.product.selling_price} DH / {item.product.unit}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 2,
                    bgcolor: COLORS.background,
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    aria-label="Diminuer"
                  >
                    <Minus size={15} />
                  </IconButton>
                  <Typography sx={{ px: 1.75, fontWeight: 600 }}>{item.quantity}</Typography>
                  <IconButton
                    size="small"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    aria-label="Augmenter"
                  >
                    <Plus size={15} />
                  </IconButton>
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, minWidth: 90, textAlign: 'right' }}>
                  {(item.product.selling_price * item.quantity).toFixed(2)} DH
                </Typography>
                <IconButton onClick={() => removeItem(item.product.id)} color="error" size="small" aria-label="Supprimer">
                  <Trash2 size={17} />
                </IconButton>
              </CardContent>
            </Card>
          ))}
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Résumé de la commande
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.25 }}>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                  Sous-total
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {totalPrice.toFixed(2)} DH
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.25 }}>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                  Livraison
                </Typography>
                <Typography variant="body2" sx={{ color: COLORS.primaryGreen, fontWeight: 600 }}>
                  {deliveryFee === 0 ? 'Gratuite' : `${deliveryFee} DH`}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Total
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: COLORS.primaryGreen }}>
                  {(totalPrice + deliveryFee).toFixed(2)} DH
                </Typography>
              </Box>
              {totalPrice < 200 && (
                <Typography variant="caption" sx={{ color: COLORS.textSecondary, display: 'block', mb: 2 }}>
                  Ajoutez {(200 - totalPrice).toFixed(2)} DH pour bénéficier de la livraison gratuite
                </Typography>
              )}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => navigate('/commande')}
                endIcon={<ArrowRight size={18} />}
                sx={{ bgcolor: COLORS.primaryGreen, '&:hover': { bgcolor: COLORS.darkGreen }, fontWeight: 700 }}
              >
                Passer la commande
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default CartPage
