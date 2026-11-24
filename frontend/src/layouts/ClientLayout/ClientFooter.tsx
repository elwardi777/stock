import React from 'react'
import { Link } from 'react-router-dom'
import { Box } from '@mui/material'

const ClientFooter: React.FC = () => (
  <footer className="sf-footer">
    <div className="shell footer-grid">
      <div>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            bgcolor: 'white',
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            mb: 1.5,
          }}
        >
          <Box component="img" src="/logo.png" alt="DFL Fresh" sx={{ height: 38, width: 'auto', objectFit: 'contain' }} />
        </Box>
        <p>
          Le goût du frais. Le plaisir de bien manger.
          <br />
          Vos produits du quotidien, livrés directement chez vous.
        </p>
      </div>

      <div>
        <h3>Nos rayons</h3>
        <div className="footer-links">
          <Link to="/produits?category=fruits">Fruits</Link>
          <Link to="/produits?category=legumes">Légumes</Link>
          <Link to="/produits?category=fruits-exotiques">Fruits Exotiques</Link>
          <Link to="/produits?category=herbes">Herbes</Link>
        </div>
      </div>

      <div>
        <h3>À découvrir</h3>
        <div className="footer-links">
          <Link to="/produits?promo=true">Nos promotions</Link>
          <Link to="/produits?category=paniers-prets">Nos paniers</Link>
          <Link to="/produits">Tout le catalogue</Link>
        </div>
      </div>

      <div>
        <h3>Mon espace</h3>
        <div className="footer-links">
          <Link to="/profil">Mon compte</Link>
          <Link to="/mes-commandes">Mes commandes</Link>
          <Link to="/panier">Mon panier</Link>
          <Link to="/commande">Ma commande</Link>
        </div>
      </div>
    </div>

    <div className="shell footer-bottom">
      <span>© {new Date().getFullYear()} DFL Fresh. Tous droits réservés.</span>
      <span>Fraîcheur · Qualité · Confiance</span>
    </div>
  </footer>
)

export default ClientFooter
