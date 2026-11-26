import React, { useState } from 'react'
import {
  Box, Typography, Grid, Card, CardContent, Table, TableHead,
  TableBody, TableRow, TableCell, TableContainer, Paper,
  TextField, InputAdornment, Button, IconButton, Chip, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select, FormControl, InputLabel
} from '@mui/material'
import { Search, Plus, Eye, EyeOff, RefreshCw, Package, AlertTriangle, XCircle, ShoppingCart, Leaf } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { useNavigate } from 'react-router-dom'
import { productsApi, stockApi } from '../../../services/api'
import { COLORS } from '../../../theme/theme'
import StatusChip from '../../../components/common/StatusChip'
import KpiCard from '../../../components/cards/KpiCard'
import { Product } from '../../../types'
import { useLiveSync } from '../../../ws'

const StockPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [adjustDialog, setAdjustDialog] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null })
  const [adjustForm, setAdjustForm] = useState({ type: 'in', quantity: '', reason: '', unit_cost: '' })

  const { data: overview, refetch: refetchOverview } = useQuery({
    queryKey: ['stock-overview'],
    queryFn: () => stockApi.overview().then(r => r.data),
  })

  const { data: productsData, isLoading, refetch: refetchProducts } = useQuery({
    queryKey: ['products', search, statusFilter],
    queryFn: () => productsApi.list({ search, status: statusFilter || undefined, limit: 100 }).then(r => r.data),
  })

  useLiveSync(['stock', 'products', 'orders'], () => {
    queryClient.invalidateQueries({ queryKey: ['products'] })
    queryClient.invalidateQueries({ queryKey: ['stock-overview'] })
    refetchOverview()
    refetchProducts()
  })

  const adjustMutation = useMutation({
    mutationFn: (data: object) => stockApi.adjust(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['stock-overview'] })
      setAdjustDialog({ open: false, product: null })
      setAdjustForm({ type: 'in', quantity: '', reason: '', unit_cost: '' })
      enqueueSnackbar('Stock ajusté avec succès', { variant: 'success' })
    },
    onError: (err: any) => enqueueSnackbar(err.response?.data?.detail || 'Erreur', { variant: 'error' }),
  })

  const toggleVisibilityMutation = useMutation({
    mutationFn: (id: string) => productsApi.toggleVisibility(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      enqueueSnackbar('Visibilité mise à jour', { variant: 'success' })
    },
  })

  const handleAdjust = () => {
    if (!adjustDialog.product) return
    adjustMutation.mutate({
      product_id: adjustDialog.product.id,
      quantity: parseFloat(adjustForm.quantity),
      type: adjustForm.type,
      reason: adjustForm.reason,
      unit_cost: adjustForm.unit_cost ? parseFloat(adjustForm.unit_cost) : undefined,
    })
  }

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
            Gestion du Stock & Tarification
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.textSecondary, mt: 0.5 }}>
            Gérez vos stocks et vos prix
          </Typography>
        </Box>
        <Button
          variant="contained" startIcon={<Plus size={16} />}
          onClick={() => navigate('/admin/products')}
          sx={{ bgcolor: COLORS.primaryGreen, '&:hover': { bgcolor: COLORS.darkGreen } }}
        >
          Ajouter un Produit
        </Button>
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { title: 'Produits Actifs', value: overview?.total_active || 0, icon: <Package size={22} />, color: COLORS.primaryGreen },
          { title: 'Stock Faible', value: overview?.low_stock || 0, icon: <AlertTriangle size={22} />, color: '#ed6c02' },
          { title: 'Rupture de Stock', value: overview?.out_of_stock || 0, icon: <XCircle size={22} />, color: '#d32f2f' },
          { title: 'Commandes à Préparer', value: overview?.pending_orders || 0, icon: <ShoppingCart size={22} />, color: COLORS.primaryGreen },
        ].map((kpi, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <KpiCard {...kpi} />
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              size="small" placeholder="Rechercher un produit..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> }}
              sx={{ minWidth: 250 }}
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Statut</InputLabel>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Statut">
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="en_stock">En stock</MenuItem>
                <MenuItem value="faible">Stock faible</MenuItem>
                <MenuItem value="rupture">Rupture</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Produit</TableCell>
              <TableCell>Catégorie</TableCell>
              <TableCell align="right">Stock Dispo</TableCell>
              <TableCell align="right">Prix Achat</TableCell>
              <TableCell align="right">Prix Vente</TableCell>
              <TableCell align="right">Marge</TableCell>
              <TableCell align="center">Statut</TableCell>
              <TableCell align="center">Affiché Client</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(productsData?.products || []).map((product: Product) => {
              const margin = product.selling_price - product.purchase_price
              const marginPct = product.purchase_price > 0 ? ((margin / product.purchase_price) * 100).toFixed(0) : '—'
              return (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        src={product.image_url ? `${API_URL}${product.image_url}` : undefined}
                        variant="rounded"
                        sx={{ width: 42, height: 42, bgcolor: COLORS.lightGreen, color: COLORS.primaryGreen }}
                      >
                        <Leaf size={18} />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {product.name_fr}
                        </Typography>
                        <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                          {product.unit}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{product.category_name || '—'}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {product.quantity} {product.unit}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">{product.purchase_price} DH</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.primaryGreen }}>
                      {product.selling_price} DH
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${marginPct}%`}
                      size="small"
                      sx={{ bgcolor: margin >= 0 ? '#e8f5e9' : '#ffebee', color: margin >= 0 ? COLORS.primaryGreen : '#d32f2f', fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <StatusChip status={product.stock_status} />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => toggleVisibilityMutation.mutate(product.id)} color={product.is_visible ? 'primary' : 'default'}>
                      {product.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </IconButton>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={() => setAdjustDialog({ open: true, product })}
                        sx={{ color: COLORS.primaryGreen }}
                      >
                        <RefreshCw size={15} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              )
            })}
            {(productsData?.products || []).length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4, color: COLORS.textSecondary }}>
                  Aucun produit trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={adjustDialog.open} onClose={() => setAdjustDialog({ open: false, product: null })} maxWidth="xs" fullWidth>
        <DialogTitle>Ajuster le stock — {adjustDialog.product?.name_fr}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel>Type de mouvement</InputLabel>
            <Select value={adjustForm.type} onChange={(e) => setAdjustForm(p => ({ ...p, type: e.target.value }))} label="Type de mouvement">
              <MenuItem value="in">Entrée de stock</MenuItem>
              <MenuItem value="out">Sortie de stock</MenuItem>
              <MenuItem value="adjustment">Ajustement manuel</MenuItem>
            </Select>
          </FormControl>
          <TextField fullWidth label="Quantité" type="number" value={adjustForm.quantity}
            onChange={(e) => setAdjustForm(p => ({ ...p, quantity: e.target.value }))} sx={{ mb: 2 }} />
          {adjustForm.type === 'in' && (
            <TextField fullWidth label="Prix unitaire d'achat (DH)" type="number" value={adjustForm.unit_cost}
              onChange={(e) => setAdjustForm(p => ({ ...p, unit_cost: e.target.value }))} sx={{ mb: 2 }} />
          )}
          <TextField fullWidth label="Raison / Note" value={adjustForm.reason}
            onChange={(e) => setAdjustForm(p => ({ ...p, reason: e.target.value }))} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAdjustDialog({ open: false, product: null })}>Annuler</Button>
          <Button variant="contained" onClick={handleAdjust} disabled={!adjustForm.quantity}
            sx={{ bgcolor: COLORS.primaryGreen, '&:hover': { bgcolor: COLORS.darkGreen } }}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default StockPage

