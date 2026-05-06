'use client'

import { useEffect } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium animate-in slide-in-from-top-2
        ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        className="opacity-75 hover:opacity-100 text-white"
      >
        ✕
      </button>
    </div>
  )
}
