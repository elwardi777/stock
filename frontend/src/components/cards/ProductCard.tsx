import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Leaf, Plus, Check } from 'lucide-react'
import { useSnackbar } from 'notistack'
import { Product } from '../../types'
import { API_URL } from '../../services/api'
import { useCart } from '../../contexts/CartContext'

interface Props {
  product: Product
  discountPercent?: number
}

const ProductCard: React.FC<Props> = ({ product, discountPercent }) => {
  const { addItem } = useCart()
  const { enqueueSnackbar } = useSnackbar()
  const [favorite, setFavorite] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const isOutOfStock = product.quantity <= 0 || product.stock_status === 'rupture'
  const slugOrId = product.slug || product.id

  const originalPrice =
    discountPercent && discountPercent > 0
      ? product.selling_price / (1 - discountPercent / 100)
      : null

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock) return
    addItem(product, 1)
    setJustAdded(true)
    enqueueSnackbar(`${product.name_fr} ajouté au panier`, { variant: 'success' })
    setTimeout(() => setJustAdded(false), 900)
  }

  return (
    <article className="product-card">
      <div className="product-image">
        <Link to={`/products/${slugOrId}`} style={{ display: 'block', width: '100%', height: '100%' }}>
          {product.image_url ? (
            <img src={`${API_URL}${product.image_url}`} alt={product.name_fr} loading="lazy" />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', background: '#f7f9f7' }}>
              <Leaf size={42} color="#238b32" />
            </div>
          )}
        </Link>

        {discountPercent && discountPercent > 0 ? (
          <span className="sale-badge">−{discountPercent} %</span>
        ) : product.stock_status === 'faible' ? (
          <span className="sale-badge" style={{ background: '#d97706' }}>Stock limité</span>
        ) : null}

        <button
          type="button"
          className="product-favorite"
          aria-label={`Favori : ${product.name_fr}`}
          aria-pressed={favorite}
          onClick={() => setFavorite((f) => !f)}
          style={{
            background: 'rgba(255,255,255,0.9)',
            border: '1px solid #e5e7eb',
            width: 30,
            height: 30,
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            color: favorite ? '#dc2626' : '#4b5563',
          }}
        >
          <Heart size={15} fill={favorite ? 'currentColor' : 'none'} />
        </button>

        <button
          type="button"
          className="product-add"
          aria-label={`Ajouter ${product.name_fr} au panier`}
          disabled={isOutOfStock}
          onClick={handleAdd}
          style={{
            background: isOutOfStock ? '#9ca3af' : justAdded ? '#17472d' : '#238b32',
            color: '#ffffff',
            border: 'none',
            display: 'grid',
            placeItems: 'center',
            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            transition: 'transform 0.15s ease, background-color 0.15s ease',
          }}
        >
          {justAdded ? <Check size={17} strokeWidth={2.5} /> : <Plus size={18} strokeWidth={2.5} />}
        </button>
      </div>

      <div className="product-info">
        <Link to={`/products/${slugOrId}`}>
          <h3>{product.name_fr}</h3>
        </Link>
        <div className="price">
          {product.selling_price.toFixed(2)} DH
          {originalPrice && <del>{originalPrice.toFixed(2)} DH</del>}
        </div>
        <p className="unit">{product.unit}</p>
        {isOutOfStock && <p className="unit" style={{ color: '#dc2626', fontWeight: 600 }}>Indisponible</p>}
      </div>
    </article>
  )
}

export default ProductCard
