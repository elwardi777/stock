import React from 'react'
import { Container, Typography, Box, Card, CardContent } from '@mui/material'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../../../services/api'
import StatusChip from '../../../components/common/StatusChip'
import { COLORS } from '../../../theme/theme'
import { useLiveSync } from '../../../ws'

const ClientOrdersPage: React.FC = () => {
  const queryClient = useQueryClient()
  const { data, refetch } = useQuery({ queryKey: ['my-orders'], queryFn: () => ordersApi.list().then(r => r.data) })

  useLiveSync(['orders'], () => {
    queryClient.invalidateQueries({ queryKey: ['my-orders'] })
    refetch()
  })
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Mes Commandes</Typography>
      {(data?.orders || []).map((order: any) => (
        <Card key={order.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{order.order_number}</Typography>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>{new Date(order.created_at).toLocaleDateString('fr-FR')}</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <StatusChip status={order.status} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 0.5 }}>{order.total} DH</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
      {(!data?.orders || data.orders.length === 0) && (
        <Box sx={{ textAlign: 'center', py: 6, color: COLORS.textSecondary }}>
          <Typography>Vous n'avez pas encore de commandes</Typography>
        </Box>
      )}
    </Container>
  )
}
export default ClientOrdersPage

