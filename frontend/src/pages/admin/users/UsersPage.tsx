import React, { useState } from 'react'
import {
  Box, Typography, Card, CardContent, Button, Table, TableHead, TableBody,
  TableRow, TableCell, TableContainer, Paper, IconButton, Chip, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Select, FormControl, InputLabel, Switch, FormControlLabel, Grid,
  Divider, Tooltip
} from '@mui/material'
import { Plus, Trash2, Power, Shield } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { usersApi, permissionsApi } from '../../../services/api'
import { COLORS } from '../../../theme/theme'
import { User } from '../../../types'

const ROLE_COLORS: Record<string, string> = {
  administrator: '#17472D',
  gestionnaire: '#0288d1',
  livreur: '#ed6c02',
  client: '#9e9e9e',
}

const DEFAULT_FORM = {
  full_name: '', email: '', phone: '', password: '', role: 'gestionnaire',
  is_active: true, permissions: {} as Record<string, Record<string, boolean>>
}

const UsersPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()
  const [dialog, setDialog] = useState<{ open: boolean; mode: 'create' | 'edit' | 'permissions'; user?: User }>({ open: false, mode: 'create' })
  const [form, setForm] = useState({ ...DEFAULT_FORM })
  const [roleFilter, setRoleFilter] = useState('')

  const { data: modulesData } = useQuery({
    queryKey: ['permission-modules'],
    queryFn: () => permissionsApi.modules().then(r => r.data),
  })

  const { data: usersData } = useQuery({
    queryKey: ['users', roleFilter],
    queryFn: () => usersApi.list({ role: roleFilter || undefined }).then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: object) => usersApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); setDialog({ open: false, mode: 'create' }); enqueueSnackbar('Utilisateur créé', { variant: 'success' }) },
    onError: (err: any) => enqueueSnackbar(err.response?.data?.detail || 'Erreur', { variant: 'error' }),
  })

  const updatePermsMutation = useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: object }) => usersApi.updatePermissions(id, permissions),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); setDialog({ open: false, mode: 'permissions' }); enqueueSnackbar('Permissions mises à jour', { variant: 'success' }) },
    onError: (err: any) => enqueueSnackbar(err.response?.data?.detail || 'Erreur', { variant: 'error' }),
  })

  const toggleMutation = useMutation({
    mutationFn: (id: string) => usersApi.toggleStatus(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); enqueueSnackbar('Statut mis à jour', { variant: 'success' }) },
    onError: (err: any) => enqueueSnackbar(err.response?.data?.detail || 'Erreur', { variant: 'error' }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); enqueueSnackbar('Utilisateur supprimé', { variant: 'success' }) },
    onError: (err: any) => enqueueSnackbar(err.response?.data?.detail || 'Erreur', { variant: 'error' }),
  })

  const handlePermChange = (module: string, action: string, value: boolean) => {
    setForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: { ...(prev.permissions[module] || {}), [action]: value }
      }
    }))
  }

  const handleSelectAll = (module: string, actions: string[], value: boolean) => {
    const modulePerms = actions.reduce((acc, a) => ({ ...acc, [a]: value }), {})
    setForm(prev => ({ ...prev, permissions: { ...prev.permissions, [module]: modulePerms } }))
  }

  const openCreate = () => { setForm({ ...DEFAULT_FORM }); setDialog({ open: true, mode: 'create' }) }
  const openPermissions = (user: User) => { setForm({ ...DEFAULT_FORM, permissions: user.permissions || {} }); setDialog({ open: true, mode: 'permissions', user }) }

  const handleSubmit = () => {
    if (dialog.mode === 'create') createMutation.mutate(form)
    else if (dialog.mode === 'permissions' && dialog.user) {
      updatePermsMutation.mutate({ id: dialog.user.id, permissions: form.permissions })
    }
  }

  const showPermissions = form.role === 'gestionnaire' || form.role === 'livreur'
  const modules = modulesData || {}

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>Gestion des Utilisateurs</Typography>
          <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>Gérez les comptes et les permissions RBAC</Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={16} />} onClick={openCreate}
          sx={{ bgcolor: COLORS.primaryGreen, '&:hover': { bgcolor: COLORS.darkGreen } }}>
          Créer un compte
        </Button>
      </Box>

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Filtrer par rôle</InputLabel>
            <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} label="Filtrer par rôle">
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="administrator">Administrateur</MenuItem>
              <MenuItem value="gestionnaire">Gestionnaire</MenuItem>
              <MenuItem value="livreur">Livreur</MenuItem>
              <MenuItem value="client">Client</MenuItem>
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Utilisateur</TableCell>
              <TableCell>Rôle</TableCell>
              <TableCell>Téléphone</TableCell>
              <TableCell align="center">Statut</TableCell>
              <TableCell>Créé le</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(usersData?.users || []).map((user: User) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: ROLE_COLORS[user.role] || COLORS.primaryGreen, width: 36, height: 36, fontSize: '0.875rem' }}>
                      {user.full_name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{user.full_name}</Typography>
                      <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>{user.email}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={user.role} size="small"
                    sx={{ bgcolor: `${ROLE_COLORS[user.role]}20`, color: ROLE_COLORS[user.role], fontWeight: 600 }} />
                </TableCell>
                <TableCell><Typography variant="body2">{user.phone}</Typography></TableCell>
                <TableCell align="center">
                  <Chip label={user.is_active ? 'Actif' : 'Suspendu'} size="small"
                    color={user.is_active ? 'success' : 'error'} />
                </TableCell>
                <TableCell>
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    {(user.role === 'gestionnaire' || user.role === 'livreur') && (
                      <Tooltip title="Permissions">
                        <IconButton size="small" onClick={() => openPermissions(user)} sx={{ color: COLORS.primaryGreen }}>
                          <Shield size={15} />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title={user.is_active ? 'Suspendre' : 'Activer'}>
                      <IconButton size="small" onClick={() => toggleMutation.mutate(user.id)} sx={{ color: user.is_active ? '#ed6c02' : COLORS.primaryGreen }}>
                        <Power size={15} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton size="small" onClick={() => { if (window.confirm('Supprimer cet utilisateur?')) deleteMutation.mutate(user.id) }} color="error">
                        <Trash2 size={15} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialog.open && dialog.mode !== 'permissions'} onClose={() => setDialog({ open: false, mode: 'create' })} maxWidth="sm" fullWidth>
        <DialogTitle>Créer un compte</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}><TextField fullWidth label="Nom complet" value={form.full_name} onChange={(e) => setForm(p => ({ ...p, full_name: e.target.value }))} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Email" type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Téléphone" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Mot de passe" type="password" value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))} required /></Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Rôle</InputLabel>
                <Select value={form.role} onChange={(e) => setForm(p => ({ ...p, role: e.target.value }))} label="Rôle">
                  <MenuItem value="gestionnaire">Gestionnaire</MenuItem>
                  <MenuItem value="livreur">Livreur</MenuItem>
                  <MenuItem value="administrator">Administrateur</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel control={<Switch checked={form.is_active} onChange={(e) => setForm(p => ({ ...p, is_active: e.target.checked }))} color="primary" />} label="Compte actif" />
            </Grid>
          </Grid>

          {showPermissions && Object.keys(modules).length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Permissions</Typography>
              {Object.entries(modules).map(([module, data]: [string, any]) => (
                <Box key={module} sx={{ mb: 1.5, p: 1.5, bgcolor: '#F5F7F5', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{data.label}</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Button size="small" onClick={() => handleSelectAll(module, data.actions, true)} sx={{ fontSize: '0.65rem', py: 0.25 }}>Tout</Button>
                      <Button size="small" onClick={() => handleSelectAll(module, data.actions, false)} sx={{ fontSize: '0.65rem', py: 0.25 }}>Aucun</Button>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {data.actions.map((action: string) => (
                      <FormControlLabel key={action} control={
                        <Switch size="small" checked={!!(form.permissions[module]?.[action])} onChange={(e) => handlePermChange(module, action, e.target.checked)} />
                      } label={<Typography variant="caption">{action}</Typography>} />
                    ))}
                  </Box>
                </Box>
              ))}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialog({ open: false, mode: 'create' })}>Annuler</Button>
          <Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: COLORS.primaryGreen, '&:hover': { bgcolor: COLORS.darkGreen } }}>
            Créer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialog.open && dialog.mode === 'permissions'} onClose={() => setDialog({ open: false, mode: 'permissions' })} maxWidth="sm" fullWidth>
        <DialogTitle>Permissions — {dialog.user?.full_name}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {Object.entries(modules).map(([module, data]: [string, any]) => (
            <Box key={module} sx={{ mb: 1.5, p: 1.5, bgcolor: '#F5F7F5', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{data.label}</Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Button size="small" onClick={() => handleSelectAll(module, data.actions, true)} sx={{ fontSize: '0.65rem', py: 0.25 }}>Tout</Button>
                  <Button size="small" onClick={() => handleSelectAll(module, data.actions, false)} sx={{ fontSize: '0.65rem', py: 0.25 }}>Aucun</Button>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {data.actions.map((action: string) => (
                  <FormControlLabel key={action} control={
                    <Switch size="small" checked={!!(form.permissions[module]?.[action])} onChange={(e) => handlePermChange(module, action, e.target.checked)} />
                  } label={<Typography variant="caption">{action}</Typography>} />
                ))}
              </Box>
            </Box>
          ))}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialog({ open: false, mode: 'permissions' })}>Annuler</Button>
          <Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: COLORS.primaryGreen, '&:hover': { bgcolor: COLORS.darkGreen } }}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UsersPage

