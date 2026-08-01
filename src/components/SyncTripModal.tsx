'use client';

import React, { useRef, useState } from 'react';
import { ArchiveRestore, Download, FileUp, LoaderCircle, ShieldCheck, UserCheck, X } from 'lucide-react';
import { createTripBackup, importTripBackup } from '@/lib/backup';
import { Trip } from '@/types/trip';

interface SyncTripModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onOpenClaimIdentity: () => void;
  onImportTrip: (trip: Trip) => void;
}

const safeFilename = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

export default function SyncTripModal({ trip, isOpen, onClose, onOpenClaimIdentity, onImportTrip }: SyncTripModalProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);
  const [message, setMessage] = useState('');
  if (!isOpen) return null;

  const exportBackup = async () => {
    setBusy('export');
    setMessage('');
    try {
      const blob = await createTripBackup(trip);
      const file = new File([blob], `${safeFilename(trip.name)}_backup.json`, { type: 'application/json' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: `${trip.name} backup`, text: 'Trip Calculator v2 offline backup', files: [file] });
      } else {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = file.name;
        anchor.click();
        URL.revokeObjectURL(url);
      }
      setMessage('Backup ready. Keep it somewhere safe.');
    } catch (caught) {
      if (!(caught instanceof DOMException && caught.name === 'AbortError')) setMessage('Could not create the backup.');
    } finally {
      setBusy(null);
    }
  };

  const importBackup = async (file?: File) => {
    if (!file) return;
    setBusy('import');
    setMessage('');
    try {
      const imported = await importTripBackup(file);
      onImportTrip(imported);
      onClose();
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Could not import this backup.');
    } finally {
      setBusy(null);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end md:items-center justify-center md:p-4 animate-pop-in" role="dialog" aria-modal="true" aria-labelledby="backup-title">
      <div className="w-full max-w-md bg-white rounded-t-[28px] md:rounded-[28px] shadow-2xl border border-slate-200 overflow-hidden max-h-[94dvh] flex flex-col">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-950 to-indigo-950 text-white"><div className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center"><ArchiveRestore className="w-5 h-5" /></div><div><h2 id="backup-title" className="text-base font-extrabold">Offline Trip Backup</h2><p className="text-xs text-slate-300">Portable data, with your photos included</p></div></div><button onClick={onClose} aria-label="Close backup" className="w-11 h-11 -mr-2 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer"><X className="w-5 h-5" /></button></div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4"><p className="text-sm font-extrabold text-indigo-950">Your trip is local-first</p><p className="text-sm text-indigo-800 mt-1 leading-relaxed">It works without internet and is stored on this device. Export a backup before changing phones or clearing app data.</p></div>
          <button onClick={() => void exportBackup()} disabled={Boolean(busy)} className="w-full min-h-13 py-3 rounded-2xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60">{busy === 'export' ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}Export {trip.name}</button>
          <button onClick={() => fileInput.current?.click()} disabled={Boolean(busy)} className="w-full min-h-13 py-3 rounded-2xl border border-slate-300 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60">{busy === 'import' ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <FileUp className="w-5 h-5 text-indigo-600" />}Import a v2 Backup</button>
          <input ref={fileInput} type="file" accept="application/json,.json" className="hidden" onChange={(event) => void importBackup(event.target.files?.[0])} />

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2"><div className="flex items-center gap-2"><UserCheck className="w-5 h-5 text-purple-600" /><span className="text-sm font-bold text-slate-800">This device’s identity</span></div><p className="text-sm text-slate-600">Choose which trip member is adding expenses so the audit trail stays accurate.</p><button onClick={() => { onClose(); onOpenClaimIdentity(); }} className="w-full min-h-11 rounded-xl bg-purple-600 text-white font-extrabold text-sm cursor-pointer">Choose Participant Identity</button></div>

          <div className="flex items-start gap-2.5 text-xs text-slate-600 bg-slate-100 rounded-xl p-3"><ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" /><p>There is no cloud account or hidden upload in v2. Multi-device live sync can be added later with a real backend.</p></div>
          {message && <p role="status" className="text-sm font-semibold text-center text-slate-700">{message}</p>}
        </div>
      </div>
    </div>
  );
}
