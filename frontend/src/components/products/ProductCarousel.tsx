import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Skeleton } from '@mui/material'
import { Product } from '../../types'
import ProductCard from '../cards/ProductCard'

interface Props {
  title: string
  description?: string
  products: Product[]
  seeAllPath?: string
  isLoading?: boolean
  discountPercent?: number
}

const ProductCarousel: React.FC<Props> = ({
  title,
  description,
  products,
  seeAllPath = '/produits',
  isLoading = false,
  discountPercent,
}) => {
  const ref = useRef<HTMLDivElement>(null)

  if (!isLoading && products.length === 0) return null

  return (
    <section className="sf-section">
      <div className="section-heading">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        <div className="section-actions">
          <Link to={seeAllPath} className="see-all">
            Tout voir <ArrowRight size={13} />
          </Link>
          <button
            type="button"
            className="arrow-control"
            aria-label={`Précédent : ${title}`}
            disabled={!products.length}
            onClick={() => ref.current?.scrollBy({ left: -470, behavior: 'smooth' })}
          >
            <ArrowLeft size={14} />
          </button>
          <button
            type="button"
            className="arrow-control"
            aria-label={`Suivant : ${title}`}
            disabled={!products.length}
            onClick={() => ref.current?.scrollBy({ left: 470, behavior: 'smooth' })}
          >
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div className="sf-product-carousel" ref={ref}>
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <Skeleton variant="rounded" height={290} sx={{ borderRadius: 1.5 }} />
              </div>
            ))
          : products.map((product) => (
              <ProductCard key={product.id} product={product} discountPercent={discountPercent} />
            ))}
      </div>
    </section>
  )
}

export default ProductCarousel
