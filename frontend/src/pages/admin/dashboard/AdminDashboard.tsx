import React from 'react'
import { Grid, Typography, Box, Card, CardContent, Skeleton } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import {
  TrendingUp, ShoppingCart, Users, Package,
  AlertTriangle, XCircle, Clock
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts'
import KpiCard from '../../../components/cards/KpiCard'
import { dashboardApi, financeApi } from '../../../services/api'
import { COLORS } from '../../../theme/theme'
import { useLiveSync } from '../../../ws'

const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading, refetch: refetchStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.stats().then(r => r.data),
  })
  const { data: chartData, refetch: refetchChart } = useQuery({
    queryKey: ['revenue-chart'],
    queryFn: () => financeApi.revenueChart(30).then(r => r.data),
  })
  const { data: topProducts, refetch: refetchTopProducts } = useQuery({
    queryKey: ['top-products'],
    queryFn: () => financeApi.topProducts(5).then(r => r.data),
  })

  useLiveSync(['orders', 'products', 'stock', 'users', 'livraisons'], () => {
    refetchStats()
    refetchChart()
    refetchTopProducts()
  })

  const kpis = [
    { title: "Chiffre d'affaires", value: `${(stats?.monthly_revenue || 0).toFixed(0)} DH`, icon: <TrendingUp size={22} />, color: COLORS.primaryGreen },
    { title: 'Commandes', value: stats?.total_orders || 0, icon: <ShoppingCart size={22} />, color: '#0288d1' },
    { title: 'Clients actifs', value: stats?.active_clients || 0, icon: <Users size={22} />, color: '#9c27b0' },
    { title: 'Produits actifs', value: stats?.active_products || 0, icon: <Package size={22} />, color: COLORS.primaryGreen },
    { title: 'Stock faible', value: stats?.low_stock || 0, icon: <AlertTriangle size={22} />, color: '#ed6c02' },
    { title: 'Ruptures de stock', value: stats?.out_of_stock || 0, icon: <XCircle size={22} />, color: '#d32f2f' },
    { title: 'Commandes en attente', value: stats?.pending_orders || 0, icon: <Clock size={22} />, color: '#ff9800' },
  ]

  return (
    <Box className="dfl-fade-in">
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: COLORS.textPrimary }}>
        Tableau de bord
      </Typography>
      <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 3 }}>
        Vue d'ensemble de votre activité ce mois
      </Typography>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {kpis.map((kpi, i) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
            {isLoading ? (
              <Card><CardContent><Skeleton height={80} /></CardContent></Card>
            ) : (
              <KpiCard {...kpi} subtitle="Ce mois" />
            )}
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Évolution du chiffre d'affaires (30 jours)
              </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v} DH`, 'Revenu']} />
                  <Line type="monotone" dataKey="revenue" stroke={COLORS.primaryGreen} strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Produits les plus vendus
              </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topProducts || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="_id" type="category" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip formatter={(v: number) => [`${v} DH`, 'Revenu']} />
                  <Bar dataKey="total_revenue" fill={COLORS.primaryGreen} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AdminDashboard

