import React from 'react'

function SkeletonBox({ className = '' }) {
  return (
    <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="space-y-2">
          <SkeletonBox className="h-3 w-28" />
          <SkeletonBox className="h-7 w-36" />
        </div>
        <SkeletonBox className="w-10 h-10 rounded-xl" />
      </div>

      {/* Hero card */}
      <SkeletonBox className="h-44 rounded-3xl" />

      {/* Category grid */}
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <SkeletonBox key={i} className="h-24 rounded-2xl" />
        ))}
      </div>

      {/* Transactions */}
      <div className="space-y-3">
        <SkeletonBox className="h-3 w-32" />
        {[...Array(4)].map((_, i) => (
          <SkeletonBox key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

export function ListSkeleton() {
  return (
    <div className="space-y-5">
      <div className="pt-2 space-y-2">
        <SkeletonBox className="h-7 w-44" />
        <SkeletonBox className="h-3 w-24" />
      </div>
      <SkeletonBox className="h-12 rounded-2xl" />
      {[...Array(5)].map((_, i) => (
        <SkeletonBox key={i} className="h-16 rounded-2xl" />
      ))}
    </div>
  )
}

export function CardSkeleton({ count = 3 }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <SkeletonBox key={i} className="h-16 rounded-2xl" />
      ))}
    </div>
  )
}
