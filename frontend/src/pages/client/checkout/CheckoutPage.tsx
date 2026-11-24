import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container, Box, Typography, Card, CardContent, Grid,
  TextField, Button, MenuItem, Select, InputLabel, FormControl,
  Divider
} from '@mui/material'
import { CreditCard } from 'lucide-react'
import { useCart } from '../../../contexts/CartContext'
import { ordersApi } from '../../../services/api'
import { COLORS } from '../../../theme/theme'
import { useSnackbar } from 'notistack'

const TIME_SLOTS = ['08:00-12:00', '12:00-16:00', '16:00-20:00']

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate()
  const { items, totalPrice, clearCart } = useCart()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    delivery_address: '',
    delivery_city: '',
    delivery_phone: '',
    delivery_time_slot: '08:00-12:00',
    notes: '',
  })

  const deliveryFee = totalPrice >= 200 ? 0 : 15
  const total = totalPrice + deliveryFee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const orderData = {
        items: items.map(i => ({ product_id: i.product.id, quantity: i.quantity })),
        ...form,
        payment_method: 'cash_on_delivery',
      }
      const res = await ordersApi.create(orderData)
      clearCart()
      enqueueSnackbar(`Commande ${res.data.order_number} créée avec succès!`, { variant: 'success' })
      navigate('/mes-commandes')
    } catch (err: any) {
      enqueueSnackbar(err.response?.data?.detail || 'Erreur lors de la commande', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Finaliser la commande</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>Informations de livraison</Typography>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField fullWidth required label="Adresse de livraison"
                      value={form.delivery_address} onChange={(e) => setForm(p => ({ ...p, delivery_address: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth required label="Ville"
                      value={form.delivery_city} onChange={(e) => setForm(p => ({ ...p, delivery_city: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth required label="Téléphone"
                      value={form.delivery_phone} onChange={(e) => setForm(p => ({ ...p, delivery_phone: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Créneau de livraison</InputLabel>
                      <Select value={form.delivery_time_slot} onChange={(e) => setForm(p => ({ ...p, delivery_time_slot: e.target.value }))} label="Créneau de livraison">
                        {TIME_SLOTS.map(slot => <MenuItem key={slot} value={slot}>{slot}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Notes (optionnel)" multiline rows={2}
                      value={form.notes} onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))} />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2, p: 2, bgcolor: COLORS.lightGreen, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CreditCard size={18} color={COLORS.darkGreen} />
                  <Typography variant="body2" sx={{ color: COLORS.darkGreen, fontWeight: 600 }}>
                    Paiement à la livraison en espèces
                  </Typography>
                </Box>
                <Button fullWidth type="submit" variant="contained" size="large" disabled={loading} sx={{ mt: 2.5, bgcolor: COLORS.primaryGreen, '&:hover': { bgcolor: COLORS.darkGreen }, fontWeight: 700 }}>
                  {loading ? 'Envoi en cours...' : `Confirmer la commande — ${total.toFixed(2)} DH`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Récapitulatif</Typography>
              {items.map((item) => (
                <Box key={item.product.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{item.product.name_fr} × {item.quantity}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{(item.product.selling_price * item.quantity).toFixed(2)} DH</Typography>
                </Box>
              ))}
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">Sous-total</Typography>
                <Typography variant="body2">{totalPrice.toFixed(2)} DH</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Livraison</Typography>
                <Typography variant="body2" sx={{ color: COLORS.primaryGreen }}>{deliveryFee === 0 ? 'Gratuite' : `${deliveryFee} DH`}</Typography>
              </Box>
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Total</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: COLORS.primaryGreen }}>{total.toFixed(2)} DH</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default CheckoutPage

