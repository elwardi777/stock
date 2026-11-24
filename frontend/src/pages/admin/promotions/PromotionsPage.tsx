import React, { useState } from 'react'
import {
  Box, Typography, Card, CardContent, Grid, Button, Table, TableHead,
  TableBody, TableRow, TableCell, TableContainer, Paper, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Select, FormControl, InputLabel, Switch, FormControlLabel, Chip
} from '@mui/material'
import { Plus, Trash2, Tag } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { promotionsApi } from '../../../services/api'
import { COLORS } from '../../../theme/theme'

const DEFAULT_FORM = { title: '', description: '', type: 'percentage', value: '', is_active: true }

const PromotionsPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ ...DEFAULT_FORM })

  const { data: promos } = useQuery({
    queryKey: ['promotions'],
    queryFn: () => promotionsApi.list().then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: object) => promotionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] })
      setOpen(false)
      setForm({ ...DEFAULT_FORM })
      enqueueSnackbar('Promotion créée', { variant: 'success' })
    },
    onError: (err: any) => enqueueSnackbar(err.response?.data?.detail || 'Erreur', { variant: 'error' }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => promotionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] })
      enqueueSnackbar('Promotion supprimée', { variant: 'success' })
    },
  })

  const handleSubmit = () => {
    createMutation.mutate({
      ...form,
      value: parseFloat(form.value) || 0,
    })
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
            Promotions & Packs
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
            Gérez vos remises et paniers promotionnels
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setOpen(true)}
          sx={{ bgcolor: COLORS.primaryGreen, '&:hover': { bgcolor: COLORS.darkGreen } }}>
          Nouvelle Promotion
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Titre</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Valeur</TableCell>
              <TableCell align="center">Statut</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(promos || []).map((promo: any) => (
              <TableRow key={promo.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tag size={16} color={COLORS.primaryGreen} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{promo.title}</Typography>
                      <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>{promo.description}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{promo.type === 'percentage' ? 'Pourcentage' : 'Montant fixe'}</TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontWeight: 700, color: COLORS.primaryGreen }}>
                    {promo.value} {promo.type === 'percentage' ? '%' : 'DH'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip label={promo.is_active ? 'Active' : 'Inactive'} size="small" color={promo.is_active ? 'success' : 'default'} />
                </TableCell>
                <TableCell align="center">
                  <IconButton size="small" color="error" onClick={() => deleteMutation.mutate(promo.id)}>
                    <Trash2 size={15} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {(!promos || promos.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: COLORS.textSecondary }}>
                  Aucune promotion enregistrée
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Créer une promotion</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Titre" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={2} value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select value={form.type} onChange={(e) => setForm(p => ({ ...p, type: e.target.value }))} label="Type">
                  <MenuItem value="percentage">Pourcentage (%)</MenuItem>
                  <MenuItem value="fixed">Montant fixe (DH)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Valeur" type="number" value={form.value} onChange={(e) => setForm(p => ({ ...p, value: e.target.value }))} required />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel control={<Switch checked={form.is_active} onChange={(e) => setForm(p => ({ ...p, is_active: e.target.checked }))} />} label="Promotion active" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: COLORS.primaryGreen, '&:hover': { bgcolor: COLORS.darkGreen } }}>
            Créer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default PromotionsPage

