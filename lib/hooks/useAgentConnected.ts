'use client'
import { useEffect, useState } from 'react'

interface AgentStatus {
  connected: boolean
  lastSeen: string | null
}

export function useAgentConnected() {
  const [status, setStatus] = useState<AgentStatus>({ connected: false, lastSeen: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/agent/connected')
      .then(r => r.json())
      .then(d => { setStatus(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return { ...status, loading }
}
