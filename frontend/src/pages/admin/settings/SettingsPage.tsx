import React, { useState, useEffect } from 'react'
import { Box, Typography, Card, CardContent, Grid, TextField, Button } from '@mui/material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { settingsApi } from '../../../services/api'
import { COLORS } from '../../../theme/theme'

const SettingsPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    company_name: 'DFL Fresh',
    company_address: '',
    company_phone: '',
    company_email: '',
    delivery_fee: '15',
    min_order_amount: '50',
    free_delivery_threshold: '200',
  })

  const { data } = useQuery({
    queryKey: ['app-settings'],
    queryFn: () => settingsApi.get().then(r => r.data),
  })

  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      setForm({
        company_name: data.company_name || 'DFL Fresh',
        company_address: data.company_address || '',
        company_phone: data.company_phone || '',
        company_email: data.company_email || '',
        delivery_fee: String(data.delivery_fee ?? 15),
        min_order_amount: String(data.min_order_amount ?? 50),
        free_delivery_threshold: String(data.free_delivery_threshold ?? 200),
      })
    }
  }, [data])

  const updateMutation = useMutation({
    mutationFn: (payload: object) => settingsApi.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-settings'] })
      enqueueSnackbar('Paramètres enregistrés', { variant: 'success' })
    },
    onError: (err: any) => enqueueSnackbar(err.response?.data?.detail || 'Erreur', { variant: 'error' }),
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate({
      ...form,
      delivery_fee: parseFloat(form.delivery_fee) || 0,
      min_order_amount: parseFloat(form.min_order_amount) || 0,
      free_delivery_threshold: parseFloat(form.free_delivery_threshold) || 0,
    })
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textPrimary, mb: 1 }}>
        Paramètres du Système
      </Typography>
      <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 3 }}>
        Configuration générale de l'entreprise et de la livraison
      </Typography>

      <Card sx={{ maxWidth: 800 }}>
        <CardContent sx={{ p: 3 }}>
          <form onSubmit={handleSave}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Nom de l'entreprise" value={form.company_name}
                  onChange={(e) => setForm(p => ({ ...p, company_name: e.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Email" value={form.company_email}
                  onChange={(e) => setForm(p => ({ ...p, company_email: e.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Téléphone" value={form.company_phone}
                  onChange={(e) => setForm(p => ({ ...p, company_phone: e.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Adresse" value={form.company_address}
                  onChange={(e) => setForm(p => ({ ...p, company_address: e.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Frais de livraison (DH)" type="number" value={form.delivery_fee}
                  onChange={(e) => setForm(p => ({ ...p, delivery_fee: e.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Commande minimum (DH)" type="number" value={form.min_order_amount}
                  onChange={(e) => setForm(p => ({ ...p, min_order_amount: e.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Seuil livraison gratuite (DH)" type="number" value={form.free_delivery_threshold}
                  onChange={(e) => setForm(p => ({ ...p, free_delivery_threshold: e.target.value }))} />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" disabled={updateMutation.isPending}
                  sx={{ bgcolor: COLORS.primaryGreen, '&:hover': { bgcolor: COLORS.darkGreen } }}>
                  Enregistrer les paramètres
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}

export default SettingsPage

