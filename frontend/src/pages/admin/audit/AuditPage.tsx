import React, { useState } from 'react'
import {
  Box, Typography, Card, CardContent, Table, TableHead,
  TableBody, TableRow, TableCell, TableContainer, Paper, Chip,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { auditApi } from '../../../services/api'
import { COLORS } from '../../../theme/theme'

const AuditPage: React.FC = () => {
  const [moduleFilter, setModuleFilter] = useState('')

  const { data } = useQuery({
    queryKey: ['audit-logs', moduleFilter],
    queryFn: () => auditApi.list({ module: moduleFilter || undefined }).then(r => r.data),
  })

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textPrimary, mb: 1 }}>
        Journal d'activité
      </Typography>
      <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 3 }}>
        Historique complet des actions effectuées sur la plateforme
      </Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Module</InputLabel>
            <Select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} label="Module">
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="users">Utilisateurs</MenuItem>
              <MenuItem value="products">Produits</MenuItem>
              <MenuItem value="stock">Stock</MenuItem>
              <MenuItem value="orders">Commandes</MenuItem>
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Utilisateur</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(data?.logs || []).map((log: any) => (
              <TableRow key={log.id} hover>
                <TableCell>
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                    {new Date(log.created_at).toLocaleString('fr-FR')}
                  </Typography>
                </TableCell>
                <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{log.user_name}</Typography></TableCell>
                <TableCell><Chip label={log.module} size="small" /></TableCell>
                <TableCell><Chip label={log.action} size="small" color="primary" variant="outlined" /></TableCell>
                <TableCell><Typography variant="body2">{log.description}</Typography></TableCell>
              </TableRow>
            ))}
            {(!data?.logs || data.logs.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: COLORS.textSecondary }}>
                  Aucune activité enregistrée
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default AuditPage

