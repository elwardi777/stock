import React from 'react'
import { Link } from 'react-router-dom'
import { Box, Container, Typography, Grid, Divider } from '@mui/material'
import { Phone, Mail, MapPin, Truck, CreditCard, ShieldCheck } from 'lucide-react'
import { COLORS } from '../../theme/theme'

const ClientFooter: React.FC = () => (
  <Box component="footer" sx={{ bgcolor: COLORS.darkGreen, color: 'white', pt: 6, pb: 3, mt: 'auto' }}>
    <Container maxWidth="lg">
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', bgcolor: 'white', px: 1.75, py: 0.75, borderRadius: 2.5, mb: 2 }}>
            <Box component="img" src="/logo.png" alt="DFL Fresh" sx={{ height: 42, width: 'auto', objectFit: 'contain' }} />
          </Box>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, maxWidth: 320 }}>
            Votre plateforme dédiée aux fruits et légumes frais de saison, soigneusement sélectionnés et livrés directement chez vous.
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'white' }}>
            Liens & Contact
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {[
              { icon: <Phone size={15} />, text: '+212 600 000 000' },
              { icon: <Mail size={15} />, text: 'contact@dflfresh.ma' },
              { icon: <MapPin size={15} />, text: 'Maroc — Livraison à domicile' },
            ].map((item, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: 'rgba(255,255,255,0.75)' }}>
                {item.icon}
                <Typography variant="body2">{item.text}</Typography>
              </Box>
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 2.5, mt: 2 }}>
            <Link to="/produits" style={{ color: '#A5D6A7', fontSize: '0.84rem', fontWeight: 500 }}>
              Catalogue
            </Link>
            <Link to="/panier" style={{ color: '#A5D6A7', fontSize: '0.84rem', fontWeight: 500 }}>
              Mon Panier
            </Link>
            <Link to="/mes-commandes" style={{ color: '#A5D6A7', fontSize: '0.84rem', fontWeight: 500 }}>
              Mes Commandes
            </Link>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'white' }}>
            Nos Engagements
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {[
              { icon: <Truck size={15} />, text: 'Livraison rapide sous 24h' },
              { icon: <CreditCard size={15} />, text: 'Paiement en espèces à la livraison' },
              { icon: <ShieldCheck size={15} />, text: 'Fraîcheur et qualité garanties' },
            ].map((item, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: 'rgba(255,255,255,0.75)' }}>
                {item.icon}
                <Typography variant="body2">{item.text}</Typography>
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', my: 3 }} />
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', textAlign: 'center', display: 'block' }}>
        © {new Date().getFullYear()} DFL Fresh. Tous droits réservés.
      </Typography>
    </Container>
  </Box>
)

export default ClientFooter
