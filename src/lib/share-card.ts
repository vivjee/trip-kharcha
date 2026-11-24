"use client";
import { formatDateRange } from "@/lib/date-utils";
import { getTripStats } from "@/lib/debt-simplification";
import { formatMoney } from "@/lib/money";
import { loadStoredPhoto } from "@/lib/image-storage";
import type { SimplifiedDebt, Trip } from "@/types/trip";
const canvasBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) =>
        b ? resolve(b) : reject(new Error("Unable to create summary image.")),
      "image/png",
    ),
  );
function lines(ctx: CanvasRenderingContext2D, text: string, width: number) {
  const rows: string[] = [];
  let line = "";
  for (const char of text) {
    if (line && ctx.measureText(line + char).width > width) {
      rows.push(line);
      line = "";
    }
    line += char;
  }
  if (line) rows.push(line);
  return rows;
}
async function cover(trip: Trip) {
  const blob = await loadStoredPhoto(trip.coverPhotoId);
  if (!blob) return undefined;
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  } catch {
    return undefined;
  } finally {
    URL.revokeObjectURL(url);
  }
}
export async function createShareCards(
  trip: Trip,
  debts: SimplifiedDebt[],
): Promise<Blob[]> {
  const image = await cover(trip);
  const stats = getTripStats(trip);
  const measure = document.createElement("canvas").getContext("2d");
  if (!measure) throw new Error("Image export unavailable.");
  measure.font = "24px Arial";
  const pages: { debt: SimplifiedDebt; label: string[]; height: number }[][] = [
    [],
  ];
  let used = 0;
  debts.forEach((debt, index) => {
    const label = lines(
      measure,
      `${index + 1}. ${debt.from.name} → ${debt.to.name}`,
      936,
    );
    const height = Math.max(185, label.length * 29 + 84);
    if (used && used + height > 835) {
      pages.push([]);
      used = 0;
    }
    pages[pages.length - 1].push({ debt, label, height });
    used += height + 20;
  });
  const blobs: Blob[] = [];
  for (let page = 0; page < pages.length; page++) {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1600;
    const c = canvas.getContext("2d");
    if (!c) throw new Error("Image export unavailable.");
    c.fillStyle = "#142b2c";
    c.fillRect(0, 0, 1080, 1600);
    if (image) {
      const scale = Math.max(
        1080 / image.naturalWidth,
        420 / image.naturalHeight,
      );
      c.drawImage(
        image,
        (1080 - image.naturalWidth * scale) / 2,
        (420 - image.naturalHeight * scale) / 2,
        image.naturalWidth * scale,
        image.naturalHeight * scale,
      );
      c.fillStyle = "rgba(8,23,27,.8)";
      c.fillRect(0, 0, 1080, 420);
    }
    c.fillStyle = "#b9dbcf";
    c.font = "700 20px Arial";
    c.fillText(
      "TRIP CALCULATOR · " + (page + 1) + " / " + pages.length,
      64,
      66,
    );
    c.fillStyle = "#fff";
    let titleSize = 40;
    let titleLines: string[];
    do {
      c.font = `700 ${titleSize}px Arial`;
      titleLines = lines(c, trip.name, 952);
      if (titleLines.length * (titleSize + 8) <= 228) break;
      titleSize -= 2;
    } while (titleSize > 16);
    titleLines.forEach((line, row) =>
      c.fillText(line, 64, 135 + row * (titleSize + 8)),
    );
    c.fillStyle = "#d2e1dc";
    c.font = "24px Arial";
    c.fillText(
      formatDateRange(trip) +
        " · " +
        (trip.participants.length === 1
          ? "Solo trip"
          : trip.participants.length + " members"),
      64,
      377,
    );
    c.fillStyle = "#b9dbcf";
    c.font = "700 20px Arial";
    c.fillText("TOTAL SPENT", 64, 470);
    c.fillStyle = "#fff";
    c.font = "700 52px Arial";
    c.fillText(formatMoney(stats.totalSpent, trip.currencySymbol), 64, 535);
    c.font = "700 28px Arial";
    c.fillText(
      debts.length ? "Simplified payments" : "All square. Nothing to pay.",
      64,
      604,
    );
    let y = 652;
    pages[page].forEach(({ debt: d, label, height }) => {
      c.fillStyle = "#203c3d";
      c.beginPath();
      c.roundRect(48, y, 984, height, 18);
      c.fill();
      c.fillStyle = "#f2f8f5";
      c.font = "24px Arial";
      label.forEach((line, row) => c.fillText(line, 72, y + 35 + row * 29));
      c.fillStyle = "#b1e6ce";
      c.font = "700 32px Arial";
      c.fillText(
        formatMoney(d.amount, trip.currencySymbol),
        72,
        y + height - 22,
      );
      y += height + 20;
    });
    c.fillStyle = "#b9dbcf";
    c.font = "22px Arial";
    c.fillText(
      debts.length + " pending payments · All amounts in " + trip.currency,
      64,
      1542,
    );
    blobs.push(await canvasBlob(canvas));
    canvas.width = 0;
    canvas.height = 0;
  }
  return blobs;
}
