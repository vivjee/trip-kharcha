'use client';

import { formatDateRange } from '@/lib/date-utils';
import { getTripStats } from '@/lib/debt-simplification';
import { loadStoredPhoto } from '@/lib/image-storage';
import { SimplifiedDebt, Trip } from '@/types/trip';

const canvasBlob = (canvas: HTMLCanvasElement) => new Promise<Blob>((resolve, reject) => {
  canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Unable to create share card.')), 'image/png');
});

const drawRoundedRect = (context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fill();
};

const loadBlobImage = (blob: Blob) => new Promise<HTMLImageElement>((resolve, reject) => {
  const url = URL.createObjectURL(blob);
  const image = new Image();
  image.onload = () => {
    URL.revokeObjectURL(url);
    resolve(image);
  };
  image.onerror = () => {
    URL.revokeObjectURL(url);
    reject(new Error('The trip cover could not be added to the share card.'));
  };
  image.src = url;
});

async function drawCover(context: CanvasRenderingContext2D, trip: Trip) {
  if (!trip.coverPhotoId) return false;
  const blob = await loadStoredPhoto(trip.coverPhotoId);
  if (!blob) return false;
  const image = await loadBlobImage(blob);
  const targetWidth = 1080;
  const targetHeight = 520;
  const scale = Math.max(targetWidth / image.naturalWidth, targetHeight / image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  context.drawImage(image, (targetWidth - width) / 2, (targetHeight - height) / 2, width, height);
  return true;
}

export async function createShareCard(trip: Trip, debts: SimplifiedDebt[]): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Share cards are unavailable on this device.');
  const stats = getTripStats(trip);

  const background = context.createLinearGradient(0, 0, 1080, 1350);
  background.addColorStop(0, trip.accentColor || '#312e81');
  background.addColorStop(0.55, '#111827');
  background.addColorStop(1, '#020617');
  context.fillStyle = background;
  context.fillRect(0, 0, 1080, 1350);

  const hasCover = await drawCover(context, trip);
  if (hasCover) {
    const overlay = context.createLinearGradient(0, 0, 0, 560);
    overlay.addColorStop(0, 'rgba(2, 6, 23, 0.12)');
    overlay.addColorStop(1, 'rgba(2, 6, 23, 1)');
    context.fillStyle = overlay;
    context.fillRect(0, 0, 1080, 570);
  }

  context.fillStyle = '#ffffff';
  context.font = '800 62px Arial, sans-serif';
  context.fillText(trip.name.slice(0, 28), 72, 160);
  context.fillStyle = '#c7d2fe';
  context.font = '600 28px Arial, sans-serif';
  context.fillText(`${formatDateRange(trip)} · ${trip.participants.length} members`, 72, 210);

  context.fillStyle = 'rgba(255,255,255,0.1)';
  drawRoundedRect(context, 60, 560, 960, 230, 34);
  context.fillStyle = '#a5b4fc';
  context.font = '700 24px Arial, sans-serif';
  context.fillText('TOTAL SPENT', 100, 625);
  context.fillStyle = '#ffffff';
  context.font = '900 76px Arial, sans-serif';
  context.fillText(`${trip.currencySymbol} ${stats.totalSpent.toLocaleString()}`, 100, 710);
  context.fillStyle = '#fbbf24';
  context.font = '700 26px Arial, sans-serif';
  context.fillText(`${stats.totalExpensesCount} expenses · ${trip.currency}`, 100, 758);

  context.fillStyle = '#ffffff';
  context.font = '800 34px Arial, sans-serif';
  context.fillText(debts.length ? 'Payments to settle' : 'Everyone is settled up 🎉', 72, 875);

  if (debts.length) {
    debts.slice(0, 4).forEach((debt, index) => {
      const y = 940 + index * 78;
      context.fillStyle = 'rgba(255,255,255,0.08)';
      drawRoundedRect(context, 60, y - 45, 960, 64, 18);
      context.fillStyle = '#e2e8f0';
      context.font = '700 27px Arial, sans-serif';
      context.fillText(`${debt.from.name} → ${debt.to.name}`, 92, y);
      context.fillStyle = '#6ee7b7';
      context.textAlign = 'right';
      context.fillText(`${trip.currencySymbol} ${debt.amount.toLocaleString()}`, 980, y);
      context.textAlign = 'left';
    });
  } else {
    context.fillStyle = '#6ee7b7';
    context.font = '600 28px Arial, sans-serif';
    context.fillText('No payments are pending for this trip.', 72, 935);
  }

  context.fillStyle = '#94a3b8';
  context.font = '700 24px Arial, sans-serif';
  context.fillText('TRIP CALCULATOR · NEPAL · V2', 72, 1290);
  return canvasBlob(canvas);
}
