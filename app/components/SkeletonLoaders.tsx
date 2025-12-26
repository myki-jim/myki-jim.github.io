import React from 'react';

interface ArticleCardSkeletonProps {
  layout?: 'list' | 'grid';
}

export const ArticleCardSkeleton: React.FC<ArticleCardSkeletonProps> = ({ layout = 'list' }) => {
  const isGrid = layout === 'grid';

  return (
    <div
      className={`relative flex ${isGrid ? 'flex-col' : 'flex-col md:flex-row'} gap-6 p-5 sm:p-6 rounded-[32px] bg-[var(--glass-surface)] border border-[var(--glass-border)] overflow-hidden`}
    >
      {/* Shimmer Effect */}
      <div className="absolute inset-0 rounded-[32px] overflow-hidden">
        <div className="shimmer absolute inset-0" />
      </div>

      {/* Cover Image Skeleton */}
      <div
        className={`relative z-10 rounded-2xl flex-shrink-0 ${isGrid ? 'w-full aspect-video' : 'w-full md:w-48 lg:w-64 aspect-video md:aspect-[4/3]'} bg-[var(--glass-surface-hover)]`}
      />

      {/* Content Container */}
      <div className={`flex flex-col z-10 flex-1 ${isGrid ? 'w-full' : ''}`}>
        {/* Category & Date Skeleton */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-16 h-6 rounded-full bg-[var(--glass-surface-hover)]" />
          <div className="w-24 h-4 rounded bg-[var(--glass-surface-hover)]" />
        </div>

        {/* Title Skeleton */}
        <div className="flex-1 mb-3">
          <div className="w-full h-7 rounded-lg bg-[var(--glass-surface-hover)] mb-2" />
          <div className="w-3/4 h-7 rounded-lg bg-[var(--glass-surface-hover)]" />
        </div>

        {/* Excerpt Skeleton */}
        <div className="space-y-2 mb-4">
          <div className="w-full h-4 rounded bg-[var(--glass-surface-hover)]" />
          <div className="w-full h-4 rounded bg-[var(--glass-surface-hover)]" />
          <div className="w-2/3 h-4 rounded bg-[var(--glass-surface-hover)]" />
        </div>

        {/* Read Button Skeleton */}
        <div className="flex items-center justify-end">
          <div className="w-16 h-5 rounded bg-[var(--glass-surface-hover)]" />
        </div>
      </div>

      <style jsx>{`
        .shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.05) 50%,
            transparent 100%
          );
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export const SearchResultSkeleton: React.FC = () => {
  return (
    <div className="relative p-4 rounded-2xl bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] overflow-hidden">
      {/* Shimmer Effect */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div className="shimmer absolute inset-0" />
      </div>

      {/* Icon Skeleton */}
      <div className="relative z-10 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-[var(--glass-surface)] flex-shrink-0" />

        {/* Content Skeleton */}
        <div className="flex-1 min-w-0">
          <div className="w-3/4 h-5 rounded bg-[var(--glass-surface)] mb-2" />
          <div className="w-full h-4 rounded bg-[var(--glass-surface)] mb-1" />
          <div className="w-2/3 h-4 rounded bg-[var(--glass-surface)]" />
        </div>
      </div>

      <style jsx>{`
        .shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.05) 50%,
            transparent 100%
          );
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};
