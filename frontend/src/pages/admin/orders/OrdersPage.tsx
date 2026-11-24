import React, { useState } from 'react'
import {
  Box, Typography, Card, CardContent, Grid, Table, TableHead,
  TableBody, TableRow, TableCell, TableContainer, Paper, IconButton,
  Button, MenuItem, Select, FormControl, InputLabel, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Chip
} from '@mui/material'
import { Eye, UserCheck } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { ordersApi, deliveriesApi } from '../../../services/api'
import { COLORS } from '../../../theme/theme'
import { Order } from '../../../types'
import StatusChip from '../../../components/common/StatusChip'

const ORDER_STATUSES = [
  { value: 'en_attente', label: 'En attente' },
  { value: 'confirmee', label: 'Confirmée' },
  { value: 'en_preparation', label: 'En préparation' },
  { value: 'prete_livraison', label: 'Prête livraison' },
  { value: 'en_livraison', label: 'En livraison' },
  { value: 'livree', label: 'Livrée' },
  { value: 'annulee', label: 'Annulée' },
  { value: 'non_livree', label: 'Non livrée' },
]

const OrdersPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [detailOrder, setDetailOrder] = useState<Order | null>(null)
  const [assignDialog, setAssignDialog] = useState<{ open: boolean; orderId?: string }>({ open: false })
  const [selectedLivreur, setSelectedLivreur] = useState('')

  const { data: ordersData } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: () => ordersApi.list({ status: statusFilter || undefined }).then(r => r.data),
  })

  const { data: livreurs } = useQuery({
    queryKey: ['livreurs'],
    queryFn: () => deliveriesApi.livreurs().then(r => r.data),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ordersApi.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      enqueueSnackbar('Statut mis à jour', { variant: 'success' })
    },
    onError: (err: any) => enqueueSnackbar(err.response?.data?.detail || 'Erreur', { variant: 'error' }),
  })

  const assignMutation = useMutation({
    mutationFn: ({ orderId, livreurId }: { orderId: string; livreurId: string }) =>
      ordersApi.assignLivreur(orderId, livreurId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      setAssignDialog({ open: false })
      enqueueSnackbar('Livreur assigné', { variant: 'success' })
    },
    onError: (err: any) => enqueueSnackbar(err.response?.data?.detail || 'Erreur', { variant: 'error' }),
  })

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
          Gestion des Commandes
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
          {ordersData?.total || 0} commandes au total
        </Typography>
      </Box>

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Filtrer par statut</InputLabel>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Filtrer par statut">
              <MenuItem value="">Toutes</MenuItem>
              {ORDER_STATUSES.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Numéro</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Ville</TableCell>
              <TableCell>Créneau</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="center">Statut</TableCell>
              <TableCell>Livreur</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(ordersData?.orders || []).map((order: Order) => (
              <TableRow key={order.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {order.order_number}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.customer_name}</Typography>
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>{order.customer_phone}</Typography>
                </TableCell>
                <TableCell><Typography variant="body2">{order.delivery_city}</Typography></TableCell>
                <TableCell><Typography variant="body2">{order.delivery_time_slot}</Typography></TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontWeight: 700, color: COLORS.primaryGreen }}>
                    {order.total} DH
                  </Typography>
                </TableCell>
                <TableCell align="center"><StatusChip status={order.status} /></TableCell>
                <TableCell>
                  <Typography variant="body2">{order.livreur_name || '—'}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                    {new Date(order.created_at).toLocaleDateString('fr-FR')}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    <IconButton size="small" onClick={() => setDetailOrder(order)} sx={{ color: COLORS.primaryGreen }}>
                      <Eye size={15} />
                    </IconButton>
                    <IconButton size="small" onClick={() => { setAssignDialog({ open: true, orderId: order.id }); setSelectedLivreur(order.livreur_id || '') }}
                      sx={{ color: '#0288d1' }}>
                      <UserCheck size={15} />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Order Detail Dialog */}
      <Dialog open={!!detailOrder} onClose={() => setDetailOrder(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Commande — {detailOrder?.order_number}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {detailOrder && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Produits</Typography>
              {detailOrder.items.map((item, i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: `1px solid ${COLORS.border}` }}>
                  <Typography variant="body2">{item.product_name} × {item.quantity} {item.unit}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.line_total} DH</Typography>
                </Box>
              ))}
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2"><strong>Adresse:</strong> {detailOrder.delivery_address}, {detailOrder.delivery_city}</Typography>
                <Typography variant="body2"><strong>Créneau:</strong> {detailOrder.delivery_time_slot}</Typography>
                {detailOrder.notes && <Typography variant="body2"><strong>Notes:</strong> {detailOrder.notes}</Typography>}
                <Typography variant="subtitle1" sx={{ mt: 1.5, fontWeight: 700, color: COLORS.primaryGreen }}>
                  Total: {detailOrder.total} DH
                </Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Changer le statut</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {ORDER_STATUSES.map(s => (
                    <Chip key={s.value} label={s.label} size="small" clickable
                      color={detailOrder.status === s.value ? 'primary' : 'default'}
                      onClick={() => { statusMutation.mutate({ id: detailOrder.id, status: s.value }); setDetailOrder(null) }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOrder(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Assign Livreur Dialog */}
      <Dialog open={assignDialog.open} onClose={() => setAssignDialog({ open: false })} maxWidth="xs" fullWidth>
        <DialogTitle>Assigner un livreur</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Livreur</InputLabel>
            <Select value={selectedLivreur} onChange={(e) => setSelectedLivreur(e.target.value)} label="Livreur">
              {(livreurs || []).map((l: any) => (
                <MenuItem key={l.id} value={l.id}>
                  {l.full_name} ({l.active_deliveries} livraisons actives)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAssignDialog({ open: false })}>Annuler</Button>
          <Button variant="contained" disabled={!selectedLivreur}
            onClick={() => assignMutation.mutate({ orderId: assignDialog.orderId!, livreurId: selectedLivreur })}
            sx={{ bgcolor: COLORS.primaryGreen, '&:hover': { bgcolor: COLORS.darkGreen } }}>
            Assigner
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default OrdersPage

