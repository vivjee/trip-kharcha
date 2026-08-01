'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { loadStoredPhoto } from '@/lib/image-storage';

export function useStoredPhotoUrl(photoId?: string) {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    let objectUrl: string | undefined;
    let active = true;
    loadStoredPhoto(photoId).then((blob) => {
      if (!active || !blob) return;
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [photoId]);
  return url;
}

export default function StoredPhoto({ photoId, alt, className = '', priority = false }: {
  photoId?: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const url = useStoredPhotoUrl(photoId);
  if (!url) return null;
  return <Image src={url} alt={alt} fill unoptimized priority={priority} sizes="(max-width: 768px) 100vw, 480px" className={`object-cover ${className}`} />;
}
