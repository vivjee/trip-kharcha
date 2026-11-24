'use client';

import React from 'react';
import StoredPhoto from '@/components/StoredPhoto';

interface AvatarPerson {
  name: string;
  avatar: string;
  photoId?: string;
}

const sizes = {
  xs: 'w-7 h-7 text-sm',
  sm: 'w-9 h-9 text-lg',
  md: 'w-11 h-11 text-xl',
  lg: 'w-16 h-16 text-3xl',
  xl: 'w-24 h-24 text-4xl',
};

export default function Avatar({ person, size = 'md', className = '' }: {
  person: AvatarPerson;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span title={person.name} className={`relative inline-flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white border border-slate-200 shadow-sm ${sizes[size]} ${className}`}>
      <span aria-hidden="true">{person.avatar}</span>
      {person.photoId && <StoredPhoto photoId={person.photoId} alt={`${person.name}'s profile photo`} className="rounded-full" />}
    </span>
  );
}
