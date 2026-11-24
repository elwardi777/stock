import React from 'react'
import { Card, CardContent, Box, Typography } from '@mui/material'
import { COLORS, SHADOWS } from '../../theme/theme'

interface Props {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color?: string
  trend?: { value: number; label: string }
}

const KpiCard: React.FC<Props> = ({ title, value, subtitle, icon, color = COLORS.primaryGreen, trend }) => (
  <Card
    sx={{
      height: '100%',
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: SHADOWS.cardHover,
      },
    }}
  >
    <CardContent sx={{ p: 2.75 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="caption"
            sx={{
              color: COLORS.textSecondary,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontSize: '0.7rem',
              display: 'block',
            }}
          >
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: COLORS.textPrimary, mt: 0.75, mb: subtitle ? 0.25 : 0 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: 2.5,
            bgcolor: `${color}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Box>
      {trend && (
        <Typography variant="caption" sx={{ color: trend.value >= 0 ? COLORS.success : COLORS.error, mt: 1, display: 'block', fontWeight: 600 }}>
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
        </Typography>
      )}
    </CardContent>
  </Card>
)

export default KpiCard
