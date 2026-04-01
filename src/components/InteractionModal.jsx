'use client'

import { useState, useEffect } from 'react'
import useScrollStore from '@/stores/scrollStore'

export default function InteractionModal() {
  const modalContent = useScrollStore((s) => s.modalContent)
  const closeModal = useScrollStore((s) => s.closeModal)
  const isOpen = modalContent !== null
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setVisible(true)
    } else {
      const timer = setTimeout(() => setVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: isOpen ? 'auto' : 'none',
        opacity: isOpen ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
      onClick={closeModal}
    >
      <div
        style={{
          background: 'rgba(10, 10, 15, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '480px',
          width: '90%',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
          transform: isOpen ? 'scale(1)' : 'scale(0.95)',
          transition: 'transform 0.3s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {modalContent?.type === 'typing' && (
          <pre style={{
            fontFamily: "'DM Mono', 'Fira Code', monospace",
            fontSize: '14px',
            color: '#06b6d4',
            background: 'rgba(30, 30, 46, 0.8)',
            padding: '16px',
            borderRadius: '8px',
            overflow: 'auto',
            margin: 0,
            whiteSpace: 'pre-wrap',
          }}>
            {modalContent.content}
          </pre>
        )}
        <button
          onClick={closeModal}
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '8px',
            color: '#818cf8',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
          }}
        >
          Chiudi
        </button>
      </div>
    </div>
  )
}
