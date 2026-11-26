import React from 'react'
import { Box, Typography, Card, CardContent, Grid, Button, Chip } from '@mui/material'
import { Phone, MapPin, CheckCircle, XCircle } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { deliveriesApi, ordersApi } from '../../services/api'
import { COLORS } from '../../theme/theme'
import StatusChip from '../../components/common/StatusChip'
import { useLiveSync } from '../../ws'

const DeliveryDashboard: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()

  const { data: deliveries, refetch } = useQuery({
    queryKey: ['my-deliveries'],
    queryFn: () => deliveriesApi.myDeliveries().then(r => r.data),
  })

  useLiveSync(['livraisons', 'orders'], () => {
    queryClient.invalidateQueries({ queryKey: ['my-deliveries'] })
    refetch()
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ordersApi.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-deliveries'] })
      enqueueSnackbar('Statut de livraison mis à jour', { variant: 'success' })
    },
    onError: (err: any) => enqueueSnackbar(err.response?.data?.detail || 'Erreur', { variant: 'error' }),
  })

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', py: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: COLORS.textPrimary }}>
        Mes Livraisons Assignées
      </Typography>
      <Grid container spacing={2}>
        {(deliveries || []).map((order: any) => (
          <Grid item xs={12} key={order.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                    {order.order_number}
                  </Typography>
                  <StatusChip status={order.status} />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>{order.customer_name}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: COLORS.textSecondary, mb: 0.5 }}>
                  <Phone size={14} />
                  <Typography variant="body2">{order.customer_phone}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: COLORS.textSecondary, mb: 2 }}>
                  <MapPin size={14} />
                  <Typography variant="body2">{order.delivery_address}, {order.delivery_city} ({order.delivery_time_slot})</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip label={`À encaisser: ${order.total} DH`} color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
                  {order.status !== 'livree' && order.status !== 'non_livree' && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="contained" color="success" startIcon={<CheckCircle size={15} />}
                        onClick={() => statusMutation.mutate({ id: order.id, status: 'livree' })}>
                        Livrée
                      </Button>
                      <Button size="small" variant="outlined" color="error" startIcon={<XCircle size={15} />}
                        onClick={() => statusMutation.mutate({ id: order.id, status: 'non_livree' })}>
                        Échec
                      </Button>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {(!deliveries || deliveries.length === 0) && (
          <Grid item xs={12}>
            <Card><CardContent sx={{ textAlign: 'center', py: 5, color: COLORS.textSecondary }}>
              Aucune livraison assignée pour le moment.
            </CardContent></Card>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default DeliveryDashboard

