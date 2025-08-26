import React from 'react'

export default function Card({ children }) {
  return (
    <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 rounded-lg border border-gray-200 shadow-lg">
      {children}
    </div>
  )
}
