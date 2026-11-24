import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, Leaf, ShieldCheck, Sprout, Truck } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { productsApi, categoriesApi, promotionsApi } from '../../../services/api'
import { Product } from '../../../types'
import ProductCarousel from '../../../components/products/ProductCarousel'

const STORE_CATEGORY_ASSETS: Record<string, string> = {
  legumes: '/store-assets/legumes.webp',
  fruits: '/store-assets/fruits.webp',
  'fruits-exotiques': '/store-assets/exotiques.webp',
  herbes: '/store-assets/herbes.webp',
  'paniers-prets': '/store-assets/paniers.webp',
}

const HomePage: React.FC = () => {
  const { data: categoriesData } = useQuery({
    queryKey: ['public-categories'],
    queryFn: () => categoriesApi.list().then((r) => r.data),
  })

  const { data: productsData, isLoading: prodsLoading } = useQuery({
    queryKey: ['public-products-all-home'],
    queryFn: () => productsApi.listPublic({ limit: 50 }).then((r) => r.data),
  })

  const { data: activePromos } = useQuery({
    queryKey: ['public-active-promos'],
    queryFn: () => promotionsApi.activePublic().then((r) => r.data),
  })

  const allProducts: Product[] = productsData?.products || []
  const categories = categoriesData || []

  const getProductsByCatSlug = (slug: string) => {
    const cat = categories.find((c: any) => c.slug === slug)
    if (!cat) return []
    return allProducts.filter((p) => p.category_id === cat.id)
  }

  const topPromo = (activePromos || [])[0]
  const promoDiscount = topPromo?.type === 'percentage' ? Number(topPromo.value) : undefined

  return (
    <main className="shell sf-root dfl-fade-in">
      <div className="sf-breadcrumb">
        <Link to="/">Accueil</Link>
        <ChevronRight size={11} />
        <span>Le marché DFL Fresh</span>
      </div>

      {/* Hero Banner with uploaded seasonal.png */}
      <section className="hero">
        <img
          className="hero-image"
          src="/store-assets/seasonal.png"
          alt="Une caisse de légumes et fruits frais de saison"
        />
        <div className="hero-content">
          <p className="eyebrow">Du marché à votre table</p>
          <h1>
            DFL Fresh.
            <br />
            <span>Le goût du frais.</span>
          </h1>
          <p className="hero-copy">
            Des produits de saison, choisis avec soin.
            <br />
            Toute la fraîcheur du marché, chez vous.
          </p>
          <Link to="/produits" className="hero-cta">
            Faire mon marché <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Service Strip */}
      <div className="service-strip">
        <div className="service-item">
          <Truck size={20} strokeWidth={1.6} />
          <span>La fraîcheur, livrée chez vous</span>
        </div>
        <div className="service-item">
          <Sprout size={20} strokeWidth={1.6} />
          <span>Des produits soigneusement sélectionnés</span>
        </div>
        <div className="service-item">
          <Leaf size={20} strokeWidth={1.6} />
          <span>Le meilleur de chaque saison</span>
        </div>
        <div className="service-item">
          <ShieldCheck size={20} strokeWidth={1.6} />
          <span>Votre satisfaction, notre priorité</span>
        </div>
      </div>

      {/* Categories Grid with uploaded .webp photos */}
      <section className="sf-section">
        <div className="section-heading">
          <div>
            <h2>À chaque envie, son rayon</h2>
            <p>Le meilleur du frais commence ici.</p>
          </div>
          <Link to="/produits" className="see-all">
            Tous les rayons <ArrowRight size={13} />
          </Link>
        </div>
        <div className="category-grid">
          {categories.map((category: any) => (
            <Link
              to={`/produits?category=${category.slug}`}
              className="category-card"
              key={category.id}
            >
              <div className="category-picture">
                <img
                  src={STORE_CATEGORY_ASSETS[category.slug] || '/store-assets/frais.webp'}
                  alt={category.name}
                  loading="lazy"
                />
              </div>
              <h3>{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Carousel 1: La sélection du moment */}
      <ProductCarousel
        title="La sélection du moment"
        description="De belles découvertes pour votre panier."
        products={allProducts.slice(0, 12)}
        isLoading={prodsLoading}
        seeAllPath="/produits"
        discountPercent={promoDiscount}
      />

      {/* Season Band with uploaded paniers.webp */}
      <section className="season-band">
        <div>
          <p className="eyebrow">La fraîcheur à partager</p>
          <h2>Un panier. Plein d’envies.</h2>
          <p>
            Des fruits et légumes réunis pour le plaisir de cuisiner, de découvrir et de partager.
          </p>
          <Link to="/produits?category=paniers-prets" className="see-all">
            Découvrir nos paniers <ArrowRight size={15} />
          </Link>
        </div>
        <img src="/store-assets/paniers.webp" alt="Panier de fruits et légumes" loading="lazy" />
      </section>

      {/* Carousel 2: Fruits & Légumes */}
      <ProductCarousel
        title="Vos favoris du marché"
        products={[...getProductsByCatSlug('fruits'), ...getProductsByCatSlug('legumes')]}
        isLoading={prodsLoading}
        seeAllPath="/produits?category=fruits"
      />

      {/* Why DFL Fresh */}
      <section className="sf-section">
        <div className="section-heading">
          <h2>Le frais, en toute confiance</h2>
        </div>
        <div className="why-grid">
          <div>
            <Sprout size={28} color="#238b32" />
            <h3>Le goût de la saison</h3>
            <p>
              Des produits qui suivent le rythme des saisons, pour retrouver le vrai goût des bonnes choses.
            </p>
          </div>
          <div>
            <Leaf size={28} color="#238b32" />
            <h3>Une sélection soignée</h3>
            <p>
              La qualité et la fraîcheur au cœur de chaque choix, du marché jusqu’à votre table.
            </p>
          </div>
          <div>
            <ShieldCheck size={28} color="#238b32" />
            <h3>Le plaisir, simplement</h3>
            <p>
              Vos essentiels et vos nouvelles envies réunis au même endroit, pour un quotidien plus savoureux.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default HomePage
