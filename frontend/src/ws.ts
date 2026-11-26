import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'
const RECONNECT_MS = 3000
const DEBOUNCE_MS = 400

type Listener = () => void

const topicListeners = new Map<string, Set<Listener>>()
const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>()
let ws: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null

function connect() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return

  try {
    ws = new WebSocket(WS_URL)
  } catch {
    scheduleReconnect()
    return
  }

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      const topic: string | undefined = data?.topic
      if (!topic) return

      const listeners = topicListeners.get(topic)
      if (!listeners || listeners.size === 0) return

      // Debounce per topic
      const existing = debounceTimers.get(topic)
      if (existing) clearTimeout(existing)

      debounceTimers.set(
        topic,
        setTimeout(() => {
          debounceTimers.delete(topic)
          listeners.forEach((cb) => cb())
        }, DEBOUNCE_MS),
      )
    } catch {
      // ignore malformed messages
    }
  }

  ws.onclose = () => scheduleReconnect()
  ws.onerror = () => ws?.close()
}

function scheduleReconnect() {
  if (reconnectTimer) return
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    connect()
  }, RECONNECT_MS)
}

export function subscribeTopic(topic: string, callback: Listener): () => void {
  if (!topicListeners.has(topic)) topicListeners.set(topic, new Set())
  topicListeners.get(topic)!.add(callback)

  // Ensure connection is alive
  connect()

  return () => {
    const listeners = topicListeners.get(topic)
    if (listeners) {
      listeners.delete(callback)
      if (listeners.size === 0) {
        topicListeners.delete(topic)
        const timer = debounceTimers.get(topic)
        if (timer) {
          clearTimeout(timer)
          debounceTimers.delete(topic)
        }
      }
    }
  }
}

/**
 * Reusable hook that subscribes to one or multiple topics (with existing 400ms debounce)
 * and automatically unsubscribes on unmount.
 */
export function useLiveSync(topics: string | string[], refetch?: () => void): void {
  const refetchRef = useRef(refetch)
  refetchRef.current = refetch

  const topicList = Array.isArray(topics) ? topics : [topics]
  const topicKey = topicList.slice().sort().join(',')

  useEffect(() => {
    if (!topicList.length) return

    const unsubscribers = topicList.map((topic) =>
      subscribeTopic(topic, () => {
        refetchRef.current?.()
      })
    )

    return () => {
      unsubscribers.forEach((unsub) => unsub())
    }
  }, [topicKey])
}

/**
 * Map topics to React Query cache query keys for global cache invalidation
 */
export const TOPIC_QUERY_KEYS: Record<string, string[][]> = {
  orders: [
    ['orders'],
    ['admin-orders'],
    ['my-orders'],
    ['dashboard-stats'],
    ['finance-summary'],
    ['finance-chart'],
    ['top-products'],
    ['stock-overview'],
    ['deliveries'],
  ],
  products: [
    ['products'],
    ['admin-products'],
    ['categories'],
    ['categories-all'],
    ['promotions'],
    ['active-promotions'],
    ['stock-products'],
    ['dashboard-stats'],
    ['top-products'],
  ],
  stock: [
    ['stock-overview'],
    ['stock-products'],
    ['stock-movements'],
    ['products'],
    ['admin-products'],
    ['dashboard-stats'],
  ],
  users: [
    ['users'],
    ['livreurs'],
  ],
  livraisons: [
    ['deliveries'],
    ['my-deliveries'],
    ['livreurs'],
    ['admin-orders'],
    ['orders'],
  ],
  clients: [
    ['clients'],
  ],
}

/**
 * Global component placed at root inside QueryClientProvider to automatically
 * invalidate matching React Query queries whenever a WebSocket topic event is received.
 */
export function GlobalLiveSync(): null {
  const queryClient = useQueryClient()

  useEffect(() => {
    const allTopics = Object.keys(TOPIC_QUERY_KEYS)
    const unsubscribers = allTopics.map((topic) =>
      subscribeTopic(topic, () => {
        const queryKeyList = TOPIC_QUERY_KEYS[topic] || []
        queryKeyList.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey })
        })
      })
    )

    return () => {
      unsubscribers.forEach((unsub) => unsub())
    }
  }, [queryClient])

  return null
}
