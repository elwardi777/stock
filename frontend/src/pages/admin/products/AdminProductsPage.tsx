import React, { useState } from 'react'
import {
  Box, Typography, Card, CardContent, Grid, Button, Table, TableHead,
  TableBody, TableRow, TableCell, TableContainer, Paper, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Select, FormControl, InputLabel, Switch, FormControlLabel, Alert, Chip
} from '@mui/material'
import { Plus, Pencil, Trash2, Image, Leaf } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { productsApi, categoriesApi } from '../../../services/api'
import { COLORS } from '../../../theme/theme'
import { Product } from '../../../types'
import StatusChip from '../../../components/common/StatusChip'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const UNITS = ['kg', 'piece', 'botte', 'pack', 'panier', 'caisse']

const DEFAULT_FORM = {
  name_fr: '', name_ar: '', description: '', category_id: '',
  purchase_price: '', selling_price: '', unit: 'kg',
  quantity: '0', stock_threshold: '5',
  is_active: true, is_visible: true,
}

const AdminProductsPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()
  const [dialog, setDialog] = useState<{ open: boolean; product?: Product }>({ open: false })
  const [form, setForm] = useState({ ...DEFAULT_FORM })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const { data: categories } = useQuery({
    queryKey: ['all-categories'],
    queryFn: () => categoriesApi.listAll().then(r => r.data),
  })

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products', search],
    queryFn: () => productsApi.list({ search: search || undefined, limit: 100 }).then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: FormData) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      setDialog({ open: false })
      enqueueSnackbar('Produit créé avec succès', { variant: 'success' })
    },
    onError: (err: any) => enqueueSnackbar(err.response?.data?.detail || 'Erreur', { variant: 'error' }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => productsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      setDialog({ open: false })
      enqueueSnackbar('Produit mis à jour', { variant: 'success' })
    },
    onError: (err: any) => enqueueSnackbar(err.response?.data?.detail || 'Erreur', { variant: 'error' }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      enqueueSnackbar('Produit supprimé', { variant: 'success' })
    },
    onError: (err: any) => enqueueSnackbar(err.response?.data?.detail || 'Erreur', { variant: 'error' }),
  })

  const openCreate = () => {
    setForm({ ...DEFAULT_FORM })
    setImageFile(null)
    setImagePreview(null)
    setDialog({ open: true })
  }

  const openEdit = (product: Product) => {
    setForm({
      name_fr: product.name_fr,
      name_ar: product.name_ar || '',
      description: product.description || '',
      category_id: product.category_id,
      purchase_price: String(product.purchase_price),
      selling_price: String(product.selling_price),
      unit: product.unit,
      quantity: String(product.quantity),
      stock_threshold: String(product.stock_threshold),
      is_active: product.is_active,
      is_visible: product.is_visible,
    })
    setImageFile(null)
    setImagePreview(product.image_url ? `${API_URL}${product.image_url}` : null)
    setDialog({ open: true, product })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = () => {
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)))
    if (imageFile) fd.append('image', imageFile)

    if (dialog.product) {
      updateMutation.mutate({ id: dialog.product.id, data: fd })
    } else {
      createMutation.mutate(fd)
    }
  }

  const priceDiff = parseFloat(form.selling_price) - parseFloat(form.purchase_price)
  const priceWarning = !isNaN(priceDiff) && priceDiff < 0

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
            Catalogue des Produits
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
            {productsData?.total || 0} produits au total
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={16} />} onClick={openCreate}
          sx={{ bgcolor: COLORS.primaryGreen, '&:hover': { bgcolor: COLORS.darkGreen } }}>
          + Ajouter un Produit
        </Button>
      </Box>

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <TextField size="small" placeholder="Rechercher un produit..." value={search}
            onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 280 }} />
        </CardContent>
      </Card>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Produit</TableCell>
              <TableCell>Catégorie</TableCell>
              <TableCell align="right">Prix Achat</TableCell>
              <TableCell align="right">Prix Vente</TableCell>
              <TableCell align="right">Stock</TableCell>
              <TableCell align="center">Statut</TableCell>
              <TableCell align="center">Visible</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(productsData?.products || []).map((product: Product) => (
              <TableRow key={product.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                      width: 44, height: 44, borderRadius: 2, bgcolor: COLORS.lightGreen,
                      overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {product.image_url ? (
                        <img src={`${API_URL}${product.image_url}`} alt={product.name_fr}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : <Leaf size={20} color={COLORS.primaryGreen} />}
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{product.name_fr}</Typography>
                      {product.name_ar && (
                        <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>{product.name_ar}</Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell><Typography variant="body2">{product.category_name || '—'}</Typography></TableCell>
                <TableCell align="right"><Typography variant="body2">{product.purchase_price} DH</Typography></TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.primaryGreen }}>
                    {product.selling_price} DH / {product.unit}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">{product.quantity} {product.unit}</Typography>
                </TableCell>
                <TableCell align="center"><StatusChip status={product.stock_status} /></TableCell>
                <TableCell align="center">
                  <Chip label={product.is_visible ? 'Oui' : 'Non'} size="small"
                    color={product.is_visible ? 'success' : 'default'} />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    <IconButton size="small" onClick={() => openEdit(product)} sx={{ color: COLORS.primaryGreen }}>
                      <Pencil size={15} />
                    </IconButton>
                    <IconButton size="small" color="error"
                      onClick={() => { if (window.confirm('Supprimer ce produit?')) deleteMutation.mutate(product.id) }}>
                      <Trash2 size={15} />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {(!productsData?.products || productsData.products.length === 0) && !isLoading && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4, color: COLORS.textSecondary }}>
                  Aucun produit trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Product Dialog */}
      <Dialog open={dialog.open} onClose={() => setDialog({ open: false })} maxWidth="md" fullWidth>
        <DialogTitle>{dialog.product ? 'Modifier le produit' : 'Ajouter un produit'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            {/* Image upload */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 100, height: 100, borderRadius: 2, bgcolor: COLORS.lightGreen,
                  border: `2px dashed ${COLORS.border}`, overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : <Image size={28} color={COLORS.textSecondary} />}
                </Box>
                <Button variant="outlined" component="label" startIcon={<Image size={16} />}>
                  Choisir une image
                  <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth required label="Nom (Français)" value={form.name_fr}
                onChange={(e) => setForm(p => ({ ...p, name_fr: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Nom (Arabe)" value={form.name_ar}
                onChange={(e) => setForm(p => ({ ...p, name_ar: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={2} value={form.description}
                onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Catégorie</InputLabel>
                <Select value={form.category_id} onChange={(e) => setForm(p => ({ ...p, category_id: e.target.value }))} label="Catégorie">
                  {(categories || []).map((cat: any) => (
                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Unité</InputLabel>
                <Select value={form.unit} onChange={(e) => setForm(p => ({ ...p, unit: e.target.value }))} label="Unité">
                  {UNITS.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth required label="Prix d'achat (DH)" type="number"
                value={form.purchase_price} onChange={(e) => setForm(p => ({ ...p, purchase_price: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth required label="Prix de vente (DH)" type="number"
                value={form.selling_price} onChange={(e) => setForm(p => ({ ...p, selling_price: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Stock initial" type="number"
                value={form.quantity} onChange={(e) => setForm(p => ({ ...p, quantity: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Seuil d'alerte stock" type="number"
                value={form.stock_threshold} onChange={(e) => setForm(p => ({ ...p, stock_threshold: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <FormControlLabel control={<Switch checked={form.is_active} onChange={(e) => setForm(p => ({ ...p, is_active: e.target.checked }))} />} label="Actif" />
                <FormControlLabel control={<Switch checked={form.is_visible} onChange={(e) => setForm(p => ({ ...p, is_visible: e.target.checked }))} />} label="Visible" />
              </Box>
            </Grid>
            {priceWarning && (
              <Grid item xs={12}>
                <Alert severity="warning">Le prix de vente est inférieur au prix d'achat.</Alert>
              </Grid>
            )}
            {!isNaN(priceDiff) && form.purchase_price && form.selling_price && !priceWarning && (
              <Grid item xs={12}>
                <Alert severity="success">
                  Marge: {priceDiff.toFixed(2)} DH
                  ({form.purchase_price ? ((priceDiff / parseFloat(form.purchase_price)) * 100).toFixed(1) : 0}%)
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialog({ open: false })}>Annuler</Button>
          <Button variant="contained" onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
            sx={{ bgcolor: COLORS.primaryGreen, '&:hover': { bgcolor: COLORS.darkGreen } }}>
            {dialog.product ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminProductsPage

