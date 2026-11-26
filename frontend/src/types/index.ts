export interface User {
  id: string
  full_name: string
  email: string
  phone: string
  role: 'client' | 'administrator' | 'admin' | 'gestionnaire' | 'livreur' | 'commercial'
  permissions: Record<string, Record<string, boolean>>
  is_active: boolean
  created_at: string
  last_login?: string
}

export interface Product {
  id: string
  slug?: string
  name_fr: string
  name_ar?: string
  description?: string
  description_ar?: string
  category_id: string
  category_name?: string
  category_slug?: string
  purchase_price: number
  selling_price: number
  unit: 'kg' | 'piece' | 'botte' | 'pack' | 'panier' | 'caisse'
  quantity: number
  stock_threshold: number
  stock_status: 'en_stock' | 'faible' | 'rupture'
  is_active: boolean
  is_visible: boolean
  image_url?: string
  created_at: string
}

export interface Category {
  id: string
  name: string
  name_ar?: string
  slug: string
  icon?: string
  order: number
  is_active: boolean
}

export interface OrderItem {
  product_id: string
  product_name: string
  unit: string
  quantity: number
  unit_price: number
  line_total: number
  image_url?: string
}

export interface Order {
  id: string
  order_number: string
  customer_id: string
  customer_name: string
  customer_phone: string
  items: OrderItem[]
  subtotal: number
  delivery_fee: number
  total: number
  delivery_address: string
  delivery_city: string
  delivery_time_slot: string
  payment_method: string
  notes?: string
  status: OrderStatus
  livreur_id?: string
  livreur_name?: string
  status_history: StatusHistoryEntry[]
  created_at: string
}

export type OrderStatus =
  | 'en_attente'
  | 'confirmee'
  | 'en_preparation'
  | 'prete_livraison'
  | 'en_livraison'
  | 'livree'
  | 'annulee'
  | 'non_livree'

export interface StatusHistoryEntry {
  status: string
  timestamp: string
  note: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface DashboardStats {
  monthly_revenue: number
  total_orders: number
  active_clients: number
  active_products: number
  low_stock: number
  out_of_stock: number
  pending_orders: number
}

export interface Permission {
  view: boolean
  create: boolean
  update: boolean
  delete: boolean
}

export interface Promotion {
  id: string
  title: string
  description?: string
  type: 'percentage' | 'fixed'
  value: number
  product_ids?: string[]
  start_date?: string
  end_date?: string
  is_active: boolean
}

export type ClientNeedStatus = 'EN_ATTENTE_ACHAT' | 'ACHETE' | 'LIVRE' | 'ANNULE'

export interface ClientNeed {
  id: string
  produit: string
  quantite_kg: number
  status: ClientNeedStatus | string
  created_at?: string
  updated_at?: string
}

export interface CommercialClient {
  id: string
  name: string
  activity_type: string
  phone: string
  address: string
  needs: ClientNeed[]
  created_at: string
  updated_at?: string
}
