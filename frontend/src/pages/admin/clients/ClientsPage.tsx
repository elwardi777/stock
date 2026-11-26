import React, { useEffect, useMemo, useState } from 'react'
import {
    Box, Typography, Card, CardContent, Button, Table, TableHead, TableBody,
    TableRow, TableCell, TableContainer, Paper, IconButton, Chip, Avatar,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
    Select, FormControl, InputLabel, Grid, InputAdornment, Divider, Tooltip
} from '@mui/material'
import { Plus, Search, Store, Phone, MapPin, ClipboardList, Trash2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { clientsApi } from '../../../services/api'
import { COLORS } from '../../../theme/theme'
import { CommercialClient, ClientNeed, ClientNeedStatus } from '../../../types'
import { useLiveSync } from '../../../ws'

const ACTIVITY_TYPES = [
    { value: 'cafe', label: 'Café' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'greengrocer', label: 'Primeur / Épicerie' },
    { value: 'hotel', label: 'Hôtel' },
    { value: 'autre', label: 'Autre' },
]

const NEED_STATUS_CONFIG: Record<string, { label: string; color: 'warning' | 'info' | 'success' | 'error' | 'default' }> = {
    EN_ATTENTE_ACHAT: { label: 'En attente achat', color: 'warning' },
    ACHETE: { label: 'Acheté', color: 'info' },
    LIVRE: { label: 'Livré', color: 'success' },
    ANNULE: { label: 'Annulé', color: 'error' },
}

const DEFAULT_CLIENT_FORM = {
    name: '',
    activity_type: 'restaurant',
    phone: '',
    address: '',
    quartier: '',
}

const DEFAULT_NEED_FORM = {
    produit: '',
    quantite_kg: '',
}

const extractQuartierFromObj = (obj: any): string => {
    if (!obj || typeof obj !== 'object') return ''
    if (typeof obj.quartier === 'string' && obj.quartier.trim()) return obj.quartier.trim()
    if (obj.user && typeof obj.user.quartier === 'string' && obj.user.quartier.trim()) return obj.user.quartier.trim()
    if (obj.state?.user && typeof obj.state.user.quartier === 'string' && obj.state.user.quartier.trim()) return obj.state.user.quartier.trim()
    return ''
}

const getStoredUserQuartier = (): string => {
    const storages = [localStorage, sessionStorage]
    for (const store of storages) {
        try {
            for (let i = 0; i < store.length; i++) {
                const k = store.key(i)
                if (!k) continue
                const raw = store.getItem(k)
                if (!raw || (!raw.startsWith('{') && !raw.startsWith('['))) continue
                const q = extractQuartierFromObj(JSON.parse(raw))
                if (q) return q
            }
        } catch {
            // ignore storage parse errors
        }
    }
    return ''
}

const ClientsPage: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar()
    const queryClient = useQueryClient()

    const [search, setSearch] = useState('')
    const [activityFilter, setActivityFilter] = useState('')
    const [quartierFilter, setQuartierFilter] = useState('')
    const [createOpen, setCreateOpen] = useState(false)
    const [clientForm, setClientForm] = useState({ ...DEFAULT_CLIENT_FORM, quartier: '' })
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
    const [needForm, setNeedForm] = useState({ ...DEFAULT_NEED_FORM })

    const { data: clientsData, isLoading, refetch } = useQuery({
        queryKey: ['clients', search, activityFilter, quartierFilter],
        queryFn: () =>
            clientsApi
                .list({
                    search: search || undefined,
                    activity_type: activityFilter || undefined,
                    quartier: quartierFilter.trim() || undefined,
                })
                .then((r) => r.data),
    })

    const isOwnOnlyCommercial = clientsData?.visibility_mode === 'own_only'

    const assignedQuartiers = useMemo(() => {
        const fromStorage = getStoredUserQuartier()
        const fromCommercials = Array.isArray(clientsData?.commercials)
            ? clientsData.commercials.map((c: any) => c?.quartier).filter(Boolean).join(', ')
            : ''
        const fromOwnClients = Array.isArray(clientsData?.clients)
            ? clientsData.clients.map((c: any) => c?.quartier).filter(Boolean)
            : []

        const raw = fromStorage || fromCommercials
        const list = String(raw).split(',').map((q: string) => q.trim()).filter(Boolean)
        if (list.length > 0) return Array.from(new Set(list))
        if (isOwnOnlyCommercial && fromOwnClients.length > 0) {
            return Array.from(new Set(fromOwnClients))
        }
        return []
    }, [clientsData, isOwnOnlyCommercial])

    const availableQuartiersForCreate = useMemo(() => {
        if (isOwnOnlyCommercial) {
            return assignedQuartiers
        }
        const fromApi = Array.isArray(clientsData?.quartiers) ? clientsData.quartiers : []
        const fromComm = Array.isArray(clientsData?.commercials)
            ? clientsData.commercials.flatMap((c: any) =>
                String(c?.quartier || '').split(',').map((q: string) => q.trim()).filter(Boolean)
            )
            : []
        return Array.from(new Set([...fromApi, ...fromComm, ...assignedQuartiers]))
    }, [clientsData, isOwnOnlyCommercial, assignedQuartiers])

    const defaultQuartier = isOwnOnlyCommercial
        ? (assignedQuartiers[0] || '')
        : (availableQuartiersForCreate[0] || '')

    useEffect(() => {
        if (defaultQuartier) {
            setClientForm((prev) => (prev.quartier ? prev : { ...prev, quartier: defaultQuartier }))
        }
    }, [defaultQuartier])

    useLiveSync(['clients', 'users'], () => {
        queryClient.invalidateQueries({ queryKey: ['clients'] })
        refetch()
    })

    const clients: CommercialClient[] = clientsData?.clients || []

    const selectedClient = useMemo(
        () => clients.find((c) => c.id === selectedClientId) || null,
        [clients, selectedClientId],
    )

    const openCreateModal = () => {
        setClientForm({ ...DEFAULT_CLIENT_FORM, quartier: defaultQuartier })
        setCreateOpen(true)
    }

    const createClientMutation = useMutation({
        mutationFn: (data: object) => clientsApi.create(data),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['clients'] })
            setCreateOpen(false)
            setClientForm({ ...DEFAULT_CLIENT_FORM, quartier: defaultQuartier })
            enqueueSnackbar('Client ajouté avec succès', { variant: 'success' })
            if (res.data?.id) {
                setSelectedClientId(res.data.id)
            }
        },
        onError: (err: any) =>
            enqueueSnackbar(err.response?.data?.detail || 'Erreur lors de la création', { variant: 'error' }),
    })

    const addNeedMutation = useMutation({
        mutationFn: ({ clientId, data }: { clientId: string; data: object }) =>
            clientsApi.addNeed(clientId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] })
            setNeedForm({ ...DEFAULT_NEED_FORM })
            enqueueSnackbar('Besoin ajouté', { variant: 'success' })
        },
        onError: (err: any) =>
            enqueueSnackbar(err.response?.data?.detail || 'Erreur', { variant: 'error' }),
    })

    const updateNeedMutation = useMutation({
        mutationFn: ({ clientId, needId, data }: { clientId: string; needId: string; data: object }) =>
            clientsApi.updateNeed(clientId, needId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] })
            enqueueSnackbar('Besoin mis à jour', { variant: 'success' })
        },
        onError: (err: any) =>
            enqueueSnackbar(err.response?.data?.detail || 'Erreur', { variant: 'error' }),
    })

    const deleteNeedMutation = useMutation({
        mutationFn: ({ clientId, needId }: { clientId: string; needId: string }) =>
            clientsApi.deleteNeed(clientId, needId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] })
            enqueueSnackbar('Besoin supprimé', { variant: 'info' })
        },
        onError: (err: any) =>
            enqueueSnackbar(err.response?.data?.detail || 'Erreur', { variant: 'error' }),
    })

    const handleCreateClient = (e: React.FormEvent) => {
        e.preventDefault()
        if (!clientForm.name.trim()) return
        createClientMutation.mutate({
            ...clientForm,
            quartier: (clientForm.quartier || defaultQuartier).trim(),
        })
    }

    const handleAddNeed = (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedClient || !needForm.produit.trim()) return
        const qty = parseFloat(needForm.quantite_kg)
        if (isNaN(qty) || qty <= 0) {
            enqueueSnackbar('Veuillez saisir une quantité valide (> 0 kg)', { variant: 'warning' })
            return
        }
        addNeedMutation.mutate({
            clientId: selectedClient.id,
            data: {
                produit: needForm.produit.trim(),
                quantite_kg: qty,
                status: 'EN_ATTENTE_ACHAT',
            },
        })
    }

    const getActivityLabel = (val: string) =>
        ACTIVITY_TYPES.find((a) => a.value === val)?.label || val

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
                        Clients & Besoins
                    </Typography>
                    <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                        Gérez vos clients professionnels et leurs besoins quotidiens en produits frais
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Plus size={16} />}
                    onClick={openCreateModal}
                    sx={{ bgcolor: COLORS.primaryGreen, '&:hover': { bgcolor: COLORS.darkGreen } }}
                >
                    + Ajouter un client
                </Button>
            </Box>

            <Card sx={{ mb: 2 }}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <TextField
                            size="small"
                            placeholder="Rechercher un client, téléphone, adresse..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search size={16} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ minWidth: 260 }}
                        />
                        <TextField
                            size="small"
                            label="Filtrer par quartier"
                            placeholder="Ex: Maarif..."
                            value={quartierFilter}
                            onChange={(e) => setQuartierFilter(e.target.value)}
                            sx={{ minWidth: 180 }}
                        />
                        <FormControl size="small" sx={{ minWidth: 180 }}>
                            <InputLabel>Activité</InputLabel>
                            <Select
                                value={activityFilter}
                                onChange={(e) => setActivityFilter(e.target.value)}
                                label="Activité"
                            >
                                <MenuItem value="">Toutes</MenuItem>
                                {ACTIVITY_TYPES.map((a) => (
                                    <MenuItem key={a.value} value={a.value}>
                                        {a.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </CardContent>
            </Card>

            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Client</TableCell>
                            <TableCell>Activité</TableCell>
                            <TableCell>Quartier</TableCell>
                            <TableCell>Téléphone</TableCell>
                            <TableCell>Adresse</TableCell>
                            <TableCell align="center">Besoins en attente</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {clients.map((client: any) => {
                            const needs = client.needs || []
                            const pendingCount = needs.filter((n: ClientNeed) => n.status === 'EN_ATTENTE_ACHAT').length
                            const pendingKg = needs
                                .filter((n: ClientNeed) => n.status === 'EN_ATTENTE_ACHAT')
                                .reduce((sum: number, n: ClientNeed) => sum + (n.quantite_kg || 0), 0)

                            return (
                                <TableRow
                                    key={client.id}
                                    hover
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => setSelectedClientId(client.id)}
                                >
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{ bgcolor: COLORS.lightGreen, color: COLORS.darkGreen, width: 38, height: 38 }}>
                                                <Store size={18} />
                                            </Avatar>
                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                {client.name}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getActivityLabel(client.activity_type)}
                                            size="small"
                                            sx={{ bgcolor: '#e8f5e9', color: COLORS.darkGreen, fontWeight: 600 }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {client.quartier || '—'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{client.phone || '—'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                                            {client.address || '—'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        {pendingCount > 0 ? (
                                            <Chip
                                                label={`${pendingCount} produit${pendingCount > 1 ? 's' : ''} (${pendingKg} kg)`}
                                                size="small"
                                                color="warning"
                                                sx={{ fontWeight: 600 }}
                                            />
                                        ) : (
                                            <Chip label={`${needs.length} besoin${needs.length !== 1 ? 's' : ''}`} size="small" />
                                        )}
                                    </TableCell>
                                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={<ClipboardList size={15} />}
                                            onClick={() => setSelectedClientId(client.id)}
                                            sx={{ borderColor: COLORS.primaryGreen, color: COLORS.primaryGreen }}
                                        >
                                            Besoins ({needs.length})
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {clients.length === 0 && !isLoading && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 5, color: COLORS.textSecondary }}>
                                    Aucun client enregistré. Cliquez sur « + Ajouter un client » pour commencer.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
                <form onSubmit={handleCreateClient}>
                    <DialogTitle>Ajouter un client</DialogTitle>
                    <DialogContent sx={{ pt: 2 }}>
                        <Grid container spacing={2} sx={{ mt: 0.5 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Nom du client"
                                    placeholder="Ex: Hassan"
                                    value={clientForm.name}
                                    onChange={(e) => setClientForm((p) => ({ ...p, name: e.target.value }))}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Type d'activité</InputLabel>
                                    <Select
                                        value={clientForm.activity_type}
                                        onChange={(e) => setClientForm((p) => ({ ...p, activity_type: e.target.value }))}
                                        label="Type d'activité"
                                    >
                                        {ACTIVITY_TYPES.map((a) => (
                                            <MenuItem key={a.value} value={a.value}>
                                                {a.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                {availableQuartiersForCreate.length > 0 ? (
                                    <FormControl fullWidth required>
                                        <InputLabel>Quartier</InputLabel>
                                        <Select
                                            value={clientForm.quartier || defaultQuartier}
                                            onChange={(e) => setClientForm((p) => ({ ...p, quartier: e.target.value }))}
                                            label="Quartier"
                                        >
                                            {availableQuartiersForCreate.map((q: string) => (
                                                <MenuItem key={q} value={q}>
                                                    {q}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                ) : (
                                    <TextField
                                        fullWidth
                                        label="Quartier"
                                        placeholder="Ex: Maarif, Derb Sultan..."
                                        value={clientForm.quartier}
                                        onChange={(e) => setClientForm((p) => ({ ...p, quartier: e.target.value }))}
                                    />
                                )}
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Téléphone"
                                    placeholder="Ex: 0612345678"
                                    value={clientForm.phone}
                                    onChange={(e) => setClientForm((p) => ({ ...p, phone: e.target.value }))}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Adresse"
                                    placeholder="Ex: Bd fida, Casablanca"
                                    value={clientForm.address}
                                    onChange={(e) => setClientForm((p) => ({ ...p, address: e.target.value }))}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setCreateOpen(false)}>Annuler</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={createClientMutation.isPending}
                            sx={{ bgcolor: COLORS.primaryGreen, '&:hover': { bgcolor: COLORS.darkGreen } }}
                        >
                            {createClientMutation.isPending ? 'Création...' : 'Créer'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog
                open={!!selectedClient}
                onClose={() => {
                    setSelectedClientId(null)
                    setNeedForm({ ...DEFAULT_NEED_FORM })
                }}
                maxWidth="md"
                fullWidth
            >
                {selectedClient && (
                    <>
                        <DialogTitle sx={{ pb: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar sx={{ bgcolor: COLORS.primaryGreen }}>
                                        {selectedClient.name.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                            {selectedClient.name}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                                            {getActivityLabel(selectedClient.activity_type)}
                                            {(selectedClient as any).quartier ? ` • ${(selectedClient as any).quartier}` : ''}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2, color: COLORS.textSecondary, fontSize: '0.8rem' }}>
                                    {selectedClient.phone && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Phone size={14} /> {selectedClient.phone}
                                        </Box>
                                    )}
                                    {selectedClient.address && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <MapPin size={14} /> {selectedClient.address}
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </DialogTitle>

                        <Divider />

                        <DialogContent sx={{ pt: 2.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                                Ajouter un besoin du jour
                            </Typography>
                            <Box
                                component="form"
                                onSubmit={handleAddNeed}
                                sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}
                            >
                                <TextField
                                    size="small"
                                    required
                                    label="Produit"
                                    placeholder="Ex: Tomates, Oignons..."
                                    value={needForm.produit}
                                    onChange={(e) => setNeedForm((p) => ({ ...p, produit: e.target.value }))}
                                    sx={{ flex: 2, minWidth: 180 }}
                                />
                                <TextField
                                    size="small"
                                    required
                                    type="number"
                                    label="Quantité (kg)"
                                    placeholder="Ex: 30"
                                    inputProps={{ min: 0.1, step: 'any' }}
                                    value={needForm.quantite_kg}
                                    onChange={(e) => setNeedForm((p) => ({ ...p, quantite_kg: e.target.value }))}
                                    sx={{ flex: 1, minWidth: 130 }}
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<Plus size={16} />}
                                    disabled={addNeedMutation.isPending}
                                    sx={{ bgcolor: COLORS.primaryGreen, '&:hover': { bgcolor: COLORS.darkGreen }, height: 40 }}
                                >
                                    Ajouter
                                </Button>
                            </Box>

                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                                Besoins enregistrés ({selectedClient.needs?.length || 0})
                            </Typography>
                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Produit</TableCell>
                                            <TableCell align="right">Quantité (kg)</TableCell>
                                            <TableCell align="center">Statut</TableCell>
                                            <TableCell align="center">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {(selectedClient.needs || []).map((need: ClientNeed) => {
                                            const statusCfg = NEED_STATUS_CONFIG[need.status] || { label: need.status, color: 'default' as const }
                                            return (
                                                <TableRow key={need.id} hover>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {need.produit}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <TextField
                                                            size="small"
                                                            type="number"
                                                            defaultValue={need.quantite_kg}
                                                            inputProps={{ min: 0.1, step: 'any', style: { textAlign: 'right', width: 70 } }}
                                                            onBlur={(e) => {
                                                                const nextQty = parseFloat(e.target.value)
                                                                if (!isNaN(nextQty) && nextQty > 0 && nextQty !== need.quantite_kg) {
                                                                    updateNeedMutation.mutate({
                                                                        clientId: selectedClient.id,
                                                                        needId: need.id,
                                                                        data: { quantite_kg: nextQty },
                                                                    })
                                                                }
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <FormControl size="small" sx={{ minWidth: 155 }}>
                                                            <Select
                                                                value={need.status}
                                                                onChange={(e) =>
                                                                    updateNeedMutation.mutate({
                                                                        clientId: selectedClient.id,
                                                                        needId: need.id,
                                                                        data: { status: e.target.value as ClientNeedStatus },
                                                                    })
                                                                }
                                                                renderValue={(val) => (
                                                                    <Chip
                                                                        label={NEED_STATUS_CONFIG[val]?.label || val}
                                                                        size="small"
                                                                        color={statusCfg.color}
                                                                    />
                                                                )}
                                                            >
                                                                {Object.entries(NEED_STATUS_CONFIG).map(([key, cfg]) => (
                                                                    <MenuItem key={key} value={key}>
                                                                        {cfg.label}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Tooltip title="Supprimer">
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() =>
                                                                    deleteNeedMutation.mutate({
                                                                        clientId: selectedClient.id,
                                                                        needId: need.id,
                                                                    })
                                                                }
                                                            >
                                                                <Trash2 size={15} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                        {(!selectedClient.needs || selectedClient.needs.length === 0) && (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ py: 3, color: COLORS.textSecondary }}>
                                                    Aucun besoin enregistré pour ce client aujourd'hui
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </DialogContent>
                        <DialogActions sx={{ p: 2 }}>
                            <Button
                                onClick={() => {
                                    setSelectedClientId(null)
                                    setNeedForm({ ...DEFAULT_NEED_FORM })
                                }}
                            >
                                Fermer
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    )
}

export default ClientsPage