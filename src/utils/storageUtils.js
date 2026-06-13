import { supabase } from '../supabase.js';

const BUCKET = 'assets';
const BASE_URL = 'https://ofmrddakijpjelqpuhff.supabase.co/storage/v1/object/public/' + BUCKET + '/';

/**
 * Upload a File object to Supabase Storage
 * Returns the public URL string, or null on error
 */
export async function uploadAsset(file, folder = 'uploads') {
  const ext = file.name.split('.').pop().toLowerCase();
  const name = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(name, file, {
    cacheControl: '31536000',
    upsert: false,
    contentType: file.type,
  });
  if (error) { console.error('uploadAsset error:', error); return null; }
  return BASE_URL + name;
}

/**
 * Upload a base64 data URI to Supabase Storage
 * Returns the public URL string, or null on error
 */
export async function uploadBase64Asset(dataUri, folder = 'uploads', ext = 'jpg') {
  try {
    const [meta, b64] = dataUri.split(',');
    const mime = meta.match(/:(.*?);/)?.[1] || 'application/octet-stream';
    const bytes = atob(b64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    const blob = new Blob([arr], { type: mime });
    const name = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(name, blob, {
      cacheControl: '31536000',
      upsert: false,
      contentType: mime,
    });
    if (error) { console.error('uploadBase64Asset error:', error); return null; }
    return BASE_URL + name;
  } catch (e) {
    console.error('uploadBase64Asset failed:', e);
    return null;
  }
}

/** Detect if a string is a base64 data URI */
export function isBase64(str) {
  return typeof str === 'string' && str.startsWith('data:');
}
