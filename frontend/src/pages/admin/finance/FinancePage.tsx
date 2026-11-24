import React, { useState } from 'react'
import {
  Box, Typography, Grid, Card, CardContent, FormControl, InputLabel,
  Select, MenuItem
} from '@mui/material'
import { DollarSign, TrendingUp, ShoppingCart, CreditCard } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { financeApi } from '../../../services/api'
import { COLORS } from '../../../theme/theme'
import KpiCard from '../../../components/cards/KpiCard'

const FinancePage: React.FC = () => {
  const [period, setPeriod] = useState('month')

  const { data: summary } = useQuery({
    queryKey: ['finance-summary', period],
    queryFn: () => financeApi.summary(period).then(r => r.data),
  })

  const { data: chartData } = useQuery({
    queryKey: ['finance-chart'],
    queryFn: () => financeApi.revenueChart(30).then(r => r.data),
  })

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
            Finances & Rapports
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
            Suivi du chiffre d'affaires, coûts d'achat et bénéfices
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Période</InputLabel>
          <Select value={period} onChange={(e) => setPeriod(e.target.value)} label="Période">
            <MenuItem value="today">Aujourd'hui</MenuItem>
            <MenuItem value="week">Cette semaine</MenuItem>
            <MenuItem value="month">Ce mois</MenuItem>
            <MenuItem value="year">Cette année</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Chiffre d'affaires" value={`${(summary?.revenue || 0).toFixed(2)} DH`} icon={<TrendingUp size={22} />} color={COLORS.primaryGreen} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Coûts d'achats" value={`${(summary?.total_cost || 0).toFixed(2)} DH`} icon={<CreditCard size={22} />} color="#ed6c02" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Bénéfice brut" value={`${(summary?.gross_profit || 0).toFixed(2)} DH`} icon={<DollarSign size={22} />} color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Panier moyen" value={`${(summary?.avg_order_value || 0).toFixed(2)} DH`} icon={<ShoppingCart size={22} />} color="#0288d1" />
        </Grid>
      </Grid>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Évolution des revenus (30 derniers jours)
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`${v} DH`, 'Revenu']} />
              <Line type="monotone" dataKey="revenue" stroke={COLORS.primaryGreen} strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Box>
  )
}

export default FinancePage

