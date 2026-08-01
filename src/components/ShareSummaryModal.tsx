'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Check, Download, ImageDown, LoaderCircle, MessageCircle, Share2, X } from 'lucide-react';
import { formatDateRange, getTripDurationInDays } from '@/lib/date-utils';
import { calculateParticipantBalances, getTripStats } from '@/lib/debt-simplification';
import { createShareCard } from '@/lib/share-card';
import { SimplifiedDebt, Trip } from '@/types/trip';

interface ShareSummaryModalProps {
  trip: Trip;
  simplifiedDebts: SimplifiedDebt[];
  isOpen: boolean;
  onClose: () => void;
}

const safeFilename = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

export default function ShareSummaryModal({ trip, simplifiedDebts, isOpen, onClose }: ShareSummaryModalProps) {
  const [copied, setCopied] = useState(false);
  const [creatingCard, setCreatingCard] = useState(false);
  const [error, setError] = useState('');
  if (!isOpen) return null;

  const stats = getTripStats(trip);
  const balances = calculateParticipantBalances(trip);
  const duration = getTripDurationInDays(trip);
  const lines = [
    `${trip.coverImageEmoji} *${trip.name}* — Trip Summary`,
    `🗓️ *Dates:* ${formatDateRange(trip)} (${duration} ${duration === 1 ? 'day' : 'days'})`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `💰 *Total Spent:* ${trip.currencySymbol} ${stats.totalSpent.toLocaleString()} (${trip.currency})`,
    `📈 *Daily Pace:* ${trip.currencySymbol} ${Math.round(stats.totalSpent / duration).toLocaleString()} / day`,
    `👥 *Average / Person:* ${trip.currencySymbol} ${stats.perPersonAvg.toLocaleString()}`,
    `🧾 *Total Expenses:* ${stats.totalExpensesCount}`,
    '',
    '✨ *PAYMENTS TO SETTLE:*',
    ...(simplifiedDebts.length
      ? simplifiedDebts.map((debt, index) => `${index + 1}. *${debt.from.name}* → *${debt.to.name}*: ${trip.currencySymbol} ${debt.amount.toLocaleString()}`)
      : ['🎉 All debts are fully settled!']),
    '',
    '📊 *WHO PAID WHAT:*',
    ...balances.map((balance) => `• ${balance.avatar} *${balance.participantName}*: ${trip.currencySymbol} ${balance.totalPaid.toLocaleString()}`),
    '',
    'Shared via Trip Calculator v2 🏔️',
  ];
  const summaryText = lines.join('\n');

  const download = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(summaryText);
    setCopied(true);
    confetti({ particleCount: 35, spread: 45, origin: { y: 0.75 } });
    window.setTimeout(() => setCopied(false), 2200);
  };

  const shareCard = async () => {
    setCreatingCard(true);
    setError('');
    try {
      const blob = await createShareCard(trip, simplifiedDebts);
      const file = new File([blob], `${safeFilename(trip.name)}_summary.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: `${trip.name} summary`, text: 'Trip Calculator v2 summary', files: [file] });
      } else {
        download(blob, file.name);
      }
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === 'AbortError') return;
      setError(caught instanceof Error ? caught.message : 'Unable to create the share card.');
    } finally {
      setCreatingCard(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm flex items-end md:items-center justify-center md:p-4 animate-pop-in" role="dialog" aria-modal="true" aria-labelledby="share-title">
      <div className="w-full max-w-md bg-white rounded-t-[28px] md:rounded-[28px] shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94dvh]">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50"><div className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center"><Share2 className="w-5 h-5" /></div><div><h2 id="share-title" className="text-base font-extrabold text-slate-900">Share Trip Summary</h2><p className="text-xs text-slate-500">Text or a temporary visual card</p></div></div><button onClick={onClose} aria-label="Close share summary" className="w-11 h-11 -mr-2 rounded-full bg-slate-200/70 flex items-center justify-center cursor-pointer"><X className="w-5 h-5" /></button></div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <div><div className="flex items-center justify-between mb-2"><span className="text-sm font-bold text-slate-700">Group chat preview</span><span className="text-xs text-slate-400">WhatsApp / Viber ready</span></div><textarea readOnly rows={11} value={summaryText} aria-label="Trip summary text" className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50 font-mono text-xs leading-relaxed text-slate-800 focus:outline-none" /></div>
          <button onClick={() => void shareCard()} disabled={creatingCard} className="w-full min-h-13 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60">{creatingCard ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <ImageDown className="w-5 h-5" />}{creatingCard ? 'Creating card…' : 'Share Visual Summary'}</button>
          <p className="text-xs text-center text-slate-500 -mt-2">Generated only when requested. The app does not keep a screenshot.</p>
          <button onClick={() => void copyText()} className="w-full min-h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer">{copied ? <Check className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}{copied ? 'Copied!' : 'Copy for Group Chat'}</button>
          <button onClick={() => download(new Blob([summaryText], { type: 'text/plain' }), `${safeFilename(trip.name)}_summary.txt`)} className="w-full min-h-12 rounded-2xl border border-slate-300 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"><Download className="w-5 h-5 text-indigo-600" />Download Text Summary</button>
          {error && <p role="alert" className="text-sm text-rose-600 font-semibold text-center">{error}</p>}
        </div>
      </div>
    </div>
  );
}
