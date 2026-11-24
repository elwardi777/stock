import React from 'react'
import { Chip } from '@mui/material'

const STATUS_CONFIG: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'info' | 'default' }> = {
  en_attente: { label: 'En attente', color: 'warning' },
  confirmee: { label: 'Confirmée', color: 'info' },
  en_preparation: { label: 'En préparation', color: 'info' },
  prete_livraison: { label: 'Prête livraison', color: 'success' },
  en_livraison: { label: 'En livraison', color: 'info' },
  livree: { label: 'Livrée', color: 'success' },
  annulee: { label: 'Annulée', color: 'error' },
  non_livree: { label: 'Non livrée', color: 'error' },
  en_stock: { label: 'En stock', color: 'success' },
  faible: { label: 'Stock faible', color: 'warning' },
  rupture: { label: 'Rupture', color: 'error' },
}

interface Props {
  status: string
  size?: 'small' | 'medium'
}

const StatusChip: React.FC<Props> = ({ status, size = 'small' }) => {
  const config = STATUS_CONFIG[status] || { label: status, color: 'default' as const }
  return <Chip label={config.label} color={config.color} size={size} sx={{ fontWeight: 500 }} />
}

export default StatusChip

