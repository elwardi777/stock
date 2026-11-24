import React from 'react'
import {
  Box, Typography, Grid, Card, CardContent, Chip, Avatar, Table,
  TableHead, TableBody, TableRow, TableCell, TableContainer, Paper
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { deliveriesApi, ordersApi } from '../../../services/api'
import { COLORS } from '../../../theme/theme'
import StatusChip from '../../../components/common/StatusChip'

const DeliveriesPage: React.FC = () => {
  const { data: livreurs } = useQuery({
    queryKey: ['livreurs-list'],
    queryFn: () => deliveriesApi.livreurs().then(r => r.data),
  })

  const { data: ordersData } = useQuery({
    queryKey: ['delivery-orders'],
    queryFn: () => ordersApi.list({ status: 'en_livraison' }).then(r => r.data),
  })

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textPrimary, mb: 1 }}>
        Gestion des Livraisons
      </Typography>
      <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 3 }}>
        Suivi des livreurs et des livraisons en cours
      </Typography>

      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Livreurs</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {(livreurs || []).map((l: any) => (
          <Grid item xs={12} sm={6} md={4} key={l.id}>
            <Card>
              <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: COLORS.primaryGreen, width: 48, height: 48 }}>
                  {l.full_name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{l.full_name}</Typography>
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>{l.phone}</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={`${l.active_deliveries} en cours`} size="small"
                      color={l.active_deliveries > 0 ? 'warning' : 'success'} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {(!livreurs || livreurs.length === 0) && (
          <Grid item xs={12}>
            <Typography sx={{ color: COLORS.textSecondary }}>Aucun livreur actif</Typography>
          </Grid>
        )}
      </Grid>

      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Livraisons en cours</Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Commande</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Adresse</TableCell>
              <TableCell>Livreur</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="center">Statut</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(ordersData?.orders || []).map((order: any) => (
              <TableRow key={order.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {order.order_number}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{order.customer_name}</Typography>
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>{order.customer_phone}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{order.delivery_address}, {order.delivery_city}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{order.livreur_name || '—'}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontWeight: 700, color: COLORS.primaryGreen }}>{order.total} DH</Typography>
                </TableCell>
                <TableCell align="center"><StatusChip status={order.status} /></TableCell>
              </TableRow>
            ))}
            {(!ordersData?.orders || ordersData.orders.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: COLORS.textSecondary }}>
                  Aucune livraison en cours
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default DeliveriesPage

