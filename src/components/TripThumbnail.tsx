'use client';

import React, { useState } from 'react';
import { TripType } from '@/types/trip';
import { useStoredPhotoUrl } from '@/components/StoredPhoto';
import { getTripTypeMeta } from '@/lib/essentials-templates';
import { getTripInitials } from '@/lib/trip-utils';

export interface TripThumbnailProps {
  trip: {
    id?: string;
    name: string;
    coverPhotoId?: string;
    tripType?: TripType;
    accentColor?: string;
  };
  size?: 'xs' | 'sm' | 'md' | 'hero';
  className?: string;
  alt?: string;
  showInitialsFallback?: boolean;
}

export default function TripThumbnail({
  trip,
  size = 'md',
  className = '',
  alt,
  showInitialsFallback = true,
}: TripThumbnailProps) {
  const customUrl = useStoredPhotoUrl(trip.coverPhotoId);
  const [failedSource, setFailedSource] = useState('');

  // Determine fallback or default scenic image based on tripType
  const meta = getTripTypeMeta(trip.tripType);
  const effectiveSrc = customUrl || (meta?.image ? meta.image : '/images/trip-types/long_trek.webp');
  const altText = alt || `${trip.name} photo`;

  // If image errored and fallback initials are requested
  if (failedSource === effectiveSrc) {
    if (!showInitialsFallback) return null;
    return (
      <div
        className={`flex h-full w-full items-center justify-center font-black text-white ${
          trip.accentColor ? '' : 'bg-accent-1'
        } ${className}`}
        style={trip.accentColor ? { backgroundColor: trip.accentColor } : undefined}
      >
        <span className={size === 'xs' ? 'text-[11px]' : size === 'sm' ? 'text-xs' : 'text-sm'}>
          {getTripInitials(trip.name)}
        </span>
      </div>
    );
  }

  return (
    // Bundled responsive assets and private blob URLs work in the static Android export.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={effectiveSrc}
      srcSet={!customUrl && effectiveSrc.endsWith(".webp") ? effectiveSrc.replace(".webp", "-thumb.webp") + " 640w, " + effectiveSrc + " 1280w" : undefined}
      sizes={size === "hero" ? "(max-width: 768px) 100vw, 1000px" : "(max-width: 768px) 100vw, 480px"}
      alt={altText}
      onError={() => setFailedSource(effectiveSrc)}
      loading={size === 'hero' ? 'eager' : 'lazy'}
      decoding="async"
      width={1280} height={720}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}
