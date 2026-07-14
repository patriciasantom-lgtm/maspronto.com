import { put } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'

const BLOB_TOKEN = process.env.BLOB2_READ_WRITE_TOKEN

// Save arbitrary JSON to Vercel Blob, return URL
export async function saveJson(data, prefix = 'data') {
  const id = uuidv4()
  const blob = await put(`${prefix}/${id}.json`, JSON.stringify(data), {
    access: 'public',
    contentType: 'application/json',
    token: BLOB_TOKEN,
  })
  return { id, url: blob.url }
}

// Save a PDF Buffer to Vercel Blob, return public URL
export async function savePdf(buffer, filename) {
  const blob = await put(`pdfs/${filename}`, buffer, {
    access: 'public',
    contentType: 'application/pdf',
    token: BLOB_TOKEN,
  })
  return blob.url
}

// Save a PNG Buffer to Vercel Blob, return public URL
export async function savePng(buffer, filename) {
  const blob = await put(`prints/${filename}`, buffer, {
    access: 'public',
    contentType: 'image/png',
    token: BLOB_TOKEN,
  })
  return blob.url
}

// Fetch JSON from any public URL (used to load config from Blob)
export async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return res.json()
}
