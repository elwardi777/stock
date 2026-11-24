import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { ChevronRight, Leaf, Search } from 'lucide-react'
import { Skeleton } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { productsApi, categoriesApi, promotionsApi } from '../../../services/api'
import { Product } from '../../../types'
import ProductCard from '../../../components/cards/ProductCard'

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [sortBy, setSortBy] = useState('default')
  const [inStockOnly, setInStockOnly] = useState(false)

  useEffect(() => {
    setSearch(searchParams.get('q') || '')
    setCategory(searchParams.get('category') || '')
  }, [searchParams])

  const isPromoView = searchParams.get('promo') === 'true'

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list().then((r) => r.data),
  })

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['catalogue-products', search],
    queryFn: () => productsApi.list({ search: search || undefined, is_visible: true, limit: 100 }).then((r) => r.data),
  })

  const { data: activePromos } = useQuery({
    queryKey: ['public-active-promos'],
    queryFn: () => promotionsApi.activePublic().then((r) => r.data),
  })

  const topPromo = (activePromos || [])[0]
  const promoDiscount = isPromoView && topPromo?.type === 'percentage' ? Number(topPromo.value) : undefined

  const filteredProducts = useMemo(() => {
    let list: Product[] = productsData?.products || []

    if (category) {
      const matchedCat = (categories || []).find((c: any) => c.slug === category || c.id === category)
      if (matchedCat) {
        list = list.filter((p) => p.category_id === matchedCat.id)
      }
    }

    if (inStockOnly) {
      list = list.filter((p) => p.quantity > 0)
    }

    if (sortBy === 'price_asc') {
      list = [...list].sort((a, b) => a.selling_price - b.selling_price)
    } else if (sortBy === 'price_desc') {
      list = [...list].sort((a, b) => b.selling_price - a.selling_price)
    } else if (sortBy === 'name') {
      list = [...list].sort((a, b) => a.name_fr.localeCompare(b.name_fr))
    }

    return list
  }, [productsData, categories, category, inStockOnly, sortBy])

  const updateCategory = (slug: string) => {
    setCategory(slug)
    const next = new URLSearchParams(searchParams)
    if (slug) next.set('category', slug)
    else next.delete('category')
    setSearchParams(next)
  }

  return (
    <main className="shell sf-root dfl-fade-in">
      <div className="sf-breadcrumb">
        <Link to="/">Accueil</Link>
        <ChevronRight size={11} />
        <span>{isPromoView ? 'Promotions' : 'Catalogue'}</span>
      </div>

      <h1 className="page-title">
        {isPromoView ? 'Promotions & Offres Fraîcheur' : 'Notre Catalogue Frais'}
      </h1>
      <p className="page-subtitle">
        Découvrez l’ensemble de nos fruits, légumes, herbes et paniers prêts livrés chez vous.
      </p>

      <div className="catalogue-layout">
        {/* Sidebar Filters */}
        <aside>
          <div className="filter-group">
            <h3>Rechercher</h3>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Nom du produit..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 32px 9px 10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  fontSize: 13,
                }}
              />
              <Search size={15} color="#6b7280" style={{ position: 'absolute', right: 10, top: 10 }} />
            </div>
          </div>

          <div className="filter-group">
            <h3>Rayons</h3>
            <div className="filter-options">
              <label>
                <input
                  type="radio"
                  name="category"
                  checked={!category}
                  onChange={() => updateCategory('')}
                />
                <span>Tous les rayons</span>
              </label>
              {(categories || []).map((cat: any) => (
                <label key={cat.id}>
                  <input
                    type="radio"
                    name="category"
                    checked={category === cat.slug}
                    onChange={() => updateCategory(cat.slug)}
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h3>Disponibilité</h3>
            <div className="filter-options">
              <label>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                />
                <span>En stock uniquement</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Main Grid */}
        <section>
          <div className="catalogue-toolbar">
            <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
              {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''}
            </span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Trier les produits">
              <option value="default">Trier : Pertinence</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="name">Nom (A-Z)</option>
            </select>
          </div>

          {isLoading ? (
            <div className="sf-product-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={290} sx={{ borderRadius: 1.5 }} />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="sf-product-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} discountPercent={promoDiscount} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Leaf size={32} />
              <h3>Aucun produit pour cette sélection</h3>
              <p>Essayez un autre rayon ou une autre recherche.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default ProductsPage
