'use client';

import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Camera, ImagePlus, LoaderCircle, Trash2, Upload, X } from 'lucide-react';
import StoredPhoto from '@/components/StoredPhoto';
import { PhotoKind, processAndStorePhoto } from '@/lib/image-storage';

interface PhotoPickerProps {
  kind: PhotoKind;
  photoId?: string;
  fallback?: React.ReactNode;
  label: string;
  helperText?: string;
  compact?: boolean;
  onChange: (photoId: string | undefined, accentColor?: string) => void;
}

export default function PhotoPicker({ kind, photoId, fallback, label, helperText, compact = false, onChange }: PhotoPickerProps) {
  const cameraInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const chooseFile = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const result = await processAndStorePhoto(file, kind);
      onChange(result.photoId, result.accentColor);
      setMenuOpen(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to use this photo.');
    } finally {
      setBusy(false);
      if (cameraInput.current) cameraInput.current.value = '';
      if (galleryInput.current) galleryInput.current.value = '';
    }
  };

  const isProfile = kind === 'profile';
  return (
    <div className="space-y-2">
      <button type="button" onClick={() => setMenuOpen(true)} aria-label={`${photoId ? 'Change' : 'Add'} ${label}`} className={`relative overflow-hidden group cursor-pointer transition-colors ${compact ? 'w-11 h-11 rounded-xl bg-white/15 text-white border border-white/25 hover:bg-white/25' : `border-2 border-dashed border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50 hover:border-indigo-500 ${isProfile ? 'w-24 h-24 rounded-full mx-auto' : 'w-full aspect-video rounded-2xl'}`}`}>
        {!compact && photoId && <StoredPhoto photoId={photoId} alt={label} className={isProfile ? 'rounded-full' : ''} />}
        {!compact && !photoId && <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-indigo-700">{fallback || <ImagePlus className={isProfile ? 'w-7 h-7' : 'w-8 h-8'} />}<span className="text-xs font-extrabold">{label}</span></div>}
        {compact ? <Camera className="w-5 h-5 mx-auto" /> : <span className={`absolute flex items-center justify-center bg-indigo-600 text-white shadow-lg ${isProfile ? 'right-0 bottom-0 w-9 h-9 rounded-full' : 'right-3 bottom-3 w-11 h-11 rounded-xl'}`}><Camera className="w-5 h-5" /></span>}
        {busy && <span className="absolute inset-0 bg-slate-950/55 text-white flex items-center justify-center"><LoaderCircle className="w-7 h-7 animate-spin" /></span>}
      </button>
      {helperText && <p className="text-xs text-slate-500 text-center font-medium">{helperText}</p>}
      {error && <p role="alert" className="text-xs text-rose-600 text-center font-semibold">{error}</p>}

      {menuOpen && typeof document !== 'undefined' && createPortal((
        <div className="fixed inset-0 z-[70] bg-slate-950/55 flex items-end md:items-center justify-center md:p-4" role="dialog" aria-modal="true" aria-label={`Choose ${label}`}>
          <div className="w-full max-w-sm bg-white rounded-t-3xl md:rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between"><div><h3 className="text-base font-extrabold text-slate-900">{photoId ? `Change ${label}` : label}</h3><p className="text-xs text-slate-500">Photos stay on this device.</p></div><button type="button" aria-label="Close photo options" onClick={() => setMenuOpen(false)} className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer"><X className="w-5 h-5" /></button></div>
            <button type="button" onClick={() => cameraInput.current?.click()} className="w-full min-h-12 rounded-xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer"><Camera className="w-5 h-5" />Take a photo</button>
            <button type="button" onClick={() => galleryInput.current?.click()} className="w-full min-h-12 rounded-xl border border-slate-300 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"><Upload className="w-5 h-5 text-indigo-600" />Choose from phone</button>
            {photoId && <button type="button" onClick={() => { onChange(undefined); setMenuOpen(false); }} className="w-full min-h-12 rounded-xl bg-rose-50 text-rose-700 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"><Trash2 className="w-5 h-5" />Remove photo</button>}
          </div>
        </div>
      ), document.body)}

      <input ref={cameraInput} type="file" accept="image/*" capture={isProfile ? 'user' : 'environment'} className="hidden" onChange={(event) => void chooseFile(event.target.files?.[0])} />
      <input ref={galleryInput} type="file" accept="image/*" className="hidden" onChange={(event) => void chooseFile(event.target.files?.[0])} />
    </div>
  );
}
