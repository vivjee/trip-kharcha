'use client';

import { validatePhotoDataUrl } from './validation';

const DB_NAME = 'trip-calculator-v2';
const STORE_NAME = 'photos';
const DB_VERSION = 1;

export type PhotoKind = 'profile' | 'cover';

interface StoredPhoto {
  id: string;
  kind: PhotoKind;
  blob: Blob;
  createdAt: string;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function runTransaction<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const request = action(transaction.objectStore(STORE_NAME));
    transaction.oncomplete = () => { database.close(); resolve(request.result); };
    transaction.onabort = () => { database.close(); reject(transaction.error || new Error('Photo storage was interrupted.')); };
    transaction.onerror = () => { database.close(); reject(transaction.error); };
  });
}

export async function loadStoredPhoto(photoId?: string): Promise<Blob | null> {
  if (!photoId || typeof indexedDB === 'undefined') return null;
  try {
    const record = await runTransaction<StoredPhoto | undefined>('readonly', (store) => store.get(photoId));
    return record?.blob || null;
  } catch (error) {
    console.error('Unable to load photo:', error);
    return null;
  }
}

export async function deleteStoredPhoto(photoId?: string): Promise<void> {
  if (!photoId || typeof indexedDB === 'undefined') return;
  try {
    await runTransaction('readwrite', (store) => store.delete(photoId));
  } catch (error) {
    console.error('Unable to delete photo:', error);
  }
}

export async function clearStoredPhotos(): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  await runTransaction('readwrite', (store) => store.clear());
}

function loadBrowserImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('This image could not be opened.'));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Unable to compress photo.')), 'image/webp', 0.82);
  });
}

function averageColor(context: CanvasRenderingContext2D, width: number, height: number): string {
  const { data } = context.getImageData(0, 0, width, height);
  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;
  const stride = 4 * 24;
  for (let index = 0; index < data.length; index += stride) {
    if (data[index + 3] < 180) continue;
    red += data[index];
    green += data[index + 1];
    blue += data[index + 2];
    count += 1;
  }
  if (!count) return '#4f46e5';
  const channel = (value: number) => Math.max(28, Math.min(190, Math.round(value / count)));
  return `rgb(${channel(red)}, ${channel(green)}, ${channel(blue)})`;
}

export async function processAndStorePhoto(file: File, kind: PhotoKind): Promise<{ photoId: string; accentColor: string }> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.');
  if (file.size > 20 * 1024 * 1024) throw new Error('Please choose a photo smaller than 20 MB.');
  const image = await loadBrowserImage(file);
  const targetRatio = kind === 'profile' ? 1 : 16 / 9;
  const sourceRatio = image.naturalWidth / image.naturalHeight;
  let sourceWidth = image.naturalWidth;
  let sourceHeight = image.naturalHeight;
  let sourceX = 0;
  let sourceY = 0;
  if (sourceRatio > targetRatio) {
    sourceWidth = sourceHeight * targetRatio;
    sourceX = (image.naturalWidth - sourceWidth) / 2;
  } else {
    sourceHeight = sourceWidth / targetRatio;
    sourceY = (image.naturalHeight - sourceHeight) / 2;
  }

  const width = kind === 'profile' ? 320 : 1280;
  const height = kind === 'profile' ? 320 : 720;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) throw new Error('Photo processing is unavailable on this device.');
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);
  const accentColor = averageColor(context, width, height);
  const blob = await canvasToBlob(canvas);
  const photoId = `photo-${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const record: StoredPhoto = { id: photoId, kind, blob, createdAt: new Date().toISOString() };
  await runTransaction('readwrite', (store) => store.put(record));
  return { photoId, accentColor };
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function storeDataUrlPhoto(dataUrl: string, kind: PhotoKind): Promise<string> {
  validatePhotoDataUrl(dataUrl);
  const blob = await fetch(dataUrl).then((response) => response.blob());
  return (await processAndStorePhoto(new File([blob], 'backup-photo', { type: blob.type }), kind)).photoId;
}
