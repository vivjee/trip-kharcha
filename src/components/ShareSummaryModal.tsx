'use client';

import React, { useState } from 'react';
import { Trip, SimplifiedDebt } from '@/types/trip';
import { getTripStats, calculateParticipantBalances } from '@/lib/debt-simplification';
import { getTripDurationInDays, formatDateRange } from '@/lib/date-utils';
import { X, Check, Download, Share2, MessageCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ShareSummaryModalProps {
  trip: Trip;
  simplifiedDebts: SimplifiedDebt[];
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareSummaryModal({
  trip,
  simplifiedDebts,
  isOpen,
  onClose,
}: ShareSummaryModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const stats = getTripStats(trip);
  const balances = calculateParticipantBalances(trip);
  const durationDays = getTripDurationInDays(trip);
  const dateRangeStr = formatDateRange(trip);

  // Generate plain text report formatted for WhatsApp / SMS / Notes
  const generateSummaryText = () => {
    let text = `${trip.coverImageEmoji} *${trip.name}* - Trip Summary\n`;
    text += `🗓️ *Dates:* ${dateRangeStr} (${durationDays} Days)\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `💰 *Total Spent:* ${trip.currencySymbol} ${stats.totalSpent.toLocaleString()} (${trip.currency})\n`;
    text += `📈 *Daily Pace:* ${trip.currencySymbol} ${Math.round(stats.totalSpent / durationDays).toLocaleString()} / day\n`;
    text += `👥 *Average / Person:* ${trip.currencySymbol} ${stats.perPersonAvg.toLocaleString()}\n`;
    text += `🧾 *Total Expenses:* ${stats.totalExpensesCount} items\n\n`;

    text += `✨ *PAYMENTS TO SETTLE UP:* ✨\n`;
    if (simplifiedDebts.length === 0) {
      text += `🎉 All debts are fully settled up!\n\n`;
    } else {
      simplifiedDebts.forEach((debt, i) => {
        text += `${i + 1}. *${debt.from.name}* ➔ *${debt.to.name}*: ${trip.currencySymbol} ${debt.amount.toLocaleString()}\n`;
      });
      text += `\n`;
    }

    text += `📊 *WHO PAID WHAT:* \n`;
    balances.forEach((b) => {
      const balanceStr =
        b.netBalance > 0
          ? `(gets back ${trip.currencySymbol} ${b.netBalance.toLocaleString()})`
          : b.netBalance < 0
          ? `(owes ${trip.currencySymbol} ${Math.abs(b.netBalance).toLocaleString()})`
          : `(settled)`;
      text += `• ${b.avatar} *${b.participantName}*: ${trip.currencySymbol} ${b.totalPaid.toLocaleString()} ${balanceStr}\n`;
    });

    text += `\nShared via Trip Calculator 🏔️`;
    return text;
  };

  const summaryText = generateSummaryText();

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([summaryText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${trip.name.toLowerCase().replace(/\s+/g, '_')}_summary.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end md:items-center justify-center p-0 md:p-4 animate-pop-in">
      <div className="w-full max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Share2 className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Share Trip Summary</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-200/60 flex items-center justify-center text-slate-600 hover:bg-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Text Preview Box */}
        <div className="p-5 space-y-4 overflow-y-auto no-scrollbar">
          <div className="relative">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Group Chat Preview</span>
              <span className="text-[10px] text-slate-400 font-medium">WhatsApp / Viber ready</span>
            </div>
            <textarea
              readOnly
              rows={10}
              value={summaryText}
              className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50 font-mono text-xs text-slate-800 focus:outline-none select-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleCopy}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4" />
                  <span>Copy for WhatsApp / Group Chat</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="w-full py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Download Summary (.txt)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
