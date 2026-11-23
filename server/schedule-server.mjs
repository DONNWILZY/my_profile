import http from 'node:http';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, openSync, writeFileSync, fsyncSync, closeSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TYPES = new Map([
  ['Discovery call', 30], ['Software consultation', 60], ['Marketing consultation', 60],
  ['Course discussion', 30], ['Cohort training', 60], ['Speaking invitation', 30],
]);
const DAY = 86400000;
const MINUTE = 60000;
const TIMEZONE = 'Africa/Lagos';
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.pdf': 'application/pdf', '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json' };

class ApiError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}

function dateParts(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const instant = new Date(Date.UTC(year, month - 1, day));
  return year >= 2020 && instant.toISOString().slice(0, 10) === value ? { year, month, day, weekday: instant.getUTCDay() } : null;
}
function minutes(value) {
  if (typeof value !== 'string' || !/^\d{2}:\d{2}$/.test(value)) return null;
  const [hours, mins] = value.split(':').map(Number);
  return hours <= 23 && mins <= 59 ? hours * 60 + mins : null;
}
function clockTime(value) { return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`; }
function instantFor(date, time) { return Date.parse(`${date}T${time}:00+01:00`); }
function hashToken(value) { return createHash('sha256').update(value).digest('hex'); }
function publicBooking(record) {
  const { reference, type, date, time, durationMinutes, status, name, email, notes, createdAt, updatedAt } = record;
  return { reference, type, date, time, durationMinutes, status, name, email, notes, createdAt, ...(updatedAt ? { updatedAt } : {}) };
}
function stringField(value, name, maximum, required = true) {
  if (typeof value !== 'string' || (required && !value.trim()) || value.trim().length > maximum || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value)) {
    throw new ApiError(400, 'VALIDATION', `${name} ${required ? 'is required and ' : ''}must be ${maximum} characters or fewer.`);
  }
  return value.trim();
}
function validStoredBooking(booking) {
  if (!booking || typeof booking !== 'object' || !/^EG-[A-F0-9]{16}$/.test(booking.reference ?? '') || !TYPES.has(booking.type)) return false;
  const start = minutes(booking.time);
  if (!dateParts(booking.date) || start === null || start < 540 || start % 30 !== 0 || start + booking.durationMinutes > 1020 || TYPES.get(booking.type) !== booking.durationMinutes) return false;
  if (![1, 2, 3, 4, 5].includes(dateParts(booking.date).weekday) || !['confirmed', 'cancelled'].includes(booking.status)) return false;
  if (!/^[a-f0-9]{64}$/.test(booking.tokenHash ?? '') || typeof booking.name !== 'string' || !booking.name.trim() || booking.name.length > 100) return false;
  if (typeof booking.email !== 'string' || booking.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email)) return false;
  if (typeof booking.notes !== 'string' || booking.notes.length > 2000 || typeof booking.createdAt !== 'string' || !Number.isFinite(Date.parse(booking.createdAt))) return false;
  return true;
}

function readStore(dataFile) {
  try {
    const data = JSON.parse(readFileSync(dataFile, 'utf8'));
    if (data?.version !== 1 || !Array.isArray(data.bookings) || !data.bookings.every(validStoredBooking)) throw new Error('Invalid booking data');
    const refs = new Set(data.bookings.map(booking => booking.reference));
    if (refs.size !== data.bookings.length) throw new Error('Duplicate booking references');
    const active = data.bookings.filter(booking => booking.status === 'confirmed');
    for (let i = 0; i < active.length; i++) {
      if (active.slice(i + 1).some(other => other.date === active[i].date && overlaps(minutes(active[i].time), active[i].durationMinutes, minutes(other.time), other.durationMinutes))) throw new Error('Overlapping booking data');
    }
    return data;
  } catch (error) {
    if (error?.code === 'ENOENT') return { version: 1, bookings: [] };
    throw new ApiError(503, 'STORAGE_UNAVAILABLE', 'The booking calendar is temporarily unavailable. Please try again later.');
  }
}

function writeStore(dataFile, data) {
  const directory = path.dirname(dataFile);
  const temporary = path.join(directory, `.appointments-${process.pid}-${randomBytes(8).toString('hex')}.tmp`);
  let descriptor;
  try {
    mkdirSync(directory, { recursive: true, mode: 0o700 });
    descriptor = openSync(temporary, 'wx', 0o600);
    writeFileSync(descriptor, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    fsyncSync(descriptor);
    closeSync(descriptor);
    descriptor = undefined;
    renameSync(temporary, dataFile);
  } catch {
    throw new ApiError(503, 'STORAGE_UNAVAILABLE', 'The appointment could not be saved. Please try again later.');
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
    try { rmSync(temporary, { force: true }); } catch { /* No temporary file remains in the successful case. */ }
  }
}
function overlaps(start, duration, otherStart, otherDuration) { return start < otherStart + otherDuration && otherStart < start + duration; }
function validateSlot(date, time, duration, now, records, excludedReference) {
  const parsed = dateParts(date);
  const start = minutes(time);
  if (!parsed || start === null) throw new ApiError(400, 'VALIDATION', 'Choose a valid appointment date and time.');
  if (![1, 2, 3, 4, 5].includes(parsed.weekday) || start < 540 || start + duration > 1020 || start % 30 !== 0) throw new ApiError(400, 'OUTSIDE_HOURS', 'Appointments are available Monday to Friday, 09:00 to 17:00, in 30-minute intervals.');
  const instant = instantFor(date, time);
  if (instant < now.getTime() + 120 * MINUTE) throw new ApiError(400, 'TOO_SOON', 'Choose a time at least two hours from now.');
  if (instant > now.getTime() + 90 * DAY) throw new ApiError(400, 'TOO_FAR', 'Choose an appointment within the next 90 days.');
  if (records.some(booking => booking.status === 'confirmed' && booking.reference !== excludedReference && booking.date === date && overlaps(start, duration, minutes(booking.time), booking.durationMinutes))) {
    throw new ApiError(409, 'SLOT_TAKEN', 'This time is already booked. Please choose another available time.');
  }
}
async function readJson(request) {
  if (request.headers['content-type']?.split(';')[0].trim() !== 'application/json') throw new ApiError(415, 'CONTENT_TYPE', 'Send the booking details as JSON.');
  const raw = await new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let rejected = false;
    request.on('data', chunk => {
      size += chunk.length;
      if (size > 16384) {
        if (!rejected) { rejected = true; reject(new ApiError(413, 'BODY_TOO_LARGE', 'The booking details are too large.')); }
        return;
      }
      if (!rejected) chunks.push(chunk);
    });
    request.on('end', () => { if (!rejected) resolve(Buffer.concat(chunks).toString('utf8')); });
    request.on('error', () => reject(new ApiError(400, 'INVALID_BODY', 'The booking details could not be read.')));
  });
  try {
    const body = JSON.parse(raw);
    if (!body || Array.isArray(body) || typeof body !== 'object') throw new Error();
    return body;
  } catch { throw new ApiError(400, 'INVALID_JSON', 'The booking details could not be read.'); }
}
function authorize(request, record) {
  const token = request.headers.authorization?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
  const actual = Buffer.from(token ? hashToken(token) : '0'.repeat(64), 'hex');
  const expected = Buffer.from(record.tokenHash, 'hex');
  if (!token || !timingSafeEqual(actual, expected)) throw new ApiError(401, 'UNAUTHORIZED', 'The appointment management link is missing or invalid.');
}

/** One running server process must own a data file. Mutations are synchronous to serialize availability checks and atomic writes. */
export function createScheduleServer({ dataFile = path.resolve('data/appointments.json'), now = () => new Date(), distDir, allowedOrigins = [] } = {}) {
  const storageFile = path.resolve(dataFile);
  const publicDirectory = distDir ? path.resolve(distDir) : null;
  const origins = new Set(allowedOrigins);
  const server = http.createServer(async (request, response) => {
    function json(status, body) {
      response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      response.end(JSON.stringify(body));
    }
    try {
      const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
      if (url.pathname.startsWith('/api/')) {
        const origin = request.headers.origin;
        const sameOrigin = origin === `http://${request.headers.host}` || origin === `https://${request.headers.host}`;
        if (origin && !sameOrigin && !origins.has(origin)) throw new ApiError(403, 'ORIGIN_NOT_ALLOWED', 'This site is not allowed to access the booking calendar.');
        if (origin && origins.has(origin)) {
          response.setHeader('Access-Control-Allow-Origin', origin);
          response.setHeader('Vary', 'Origin');
        }
        if (request.method === 'OPTIONS') {
          response.writeHead(204, { 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Cache-Control': 'no-store' });
          response.end(); return;
        }
        if (request.method === 'GET' && url.pathname === '/api/schedule/availability') {
          const month = url.searchParams.get('month');
          if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || Number(month.slice(0, 4)) < 2020) throw new ApiError(400, 'VALIDATION', 'Choose a valid calendar month.');
          const store = readStore(storageFile);
          const busy = store.bookings.filter(booking => booking.status === 'confirmed' && booking.date.startsWith(`${month}-`)).map(booking => ({ date: booking.date, start: booking.time, end: clockTime(minutes(booking.time) + booking.durationMinutes) }));
          json(200, { timezone: TIMEZONE, slotMinutes: 30, openingTime: '09:00', closingTime: '17:00', workingDays: [1, 2, 3, 4, 5], minimumLeadMinutes: 120, horizonDays: 90, busy, serverNow: now().toISOString() }); return;
        }
        if (request.method === 'POST' && url.pathname === '/api/schedule/bookings') {
          const body = await readJson(request);
          const type = stringField(body.type, 'Appointment type', 80);
          const durationMinutes = TYPES.get(type);
          if (!durationMinutes) throw new ApiError(400, 'VALIDATION', 'Choose a supported appointment type.');
          const name = stringField(body.name, 'Name', 100);
          const email = stringField(body.email, 'Email', 254).toLowerCase();
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(400, 'VALIDATION', 'Enter a valid email address.');
          const notes = stringField(body.notes ?? '', 'Notes', 2000, false);
          const current = now();
          const store = readStore(storageFile);
          validateSlot(body.date, body.time, durationMinutes, current, store.bookings);
          const managementToken = randomBytes(32).toString('hex');
          const booking = { reference: `EG-${randomBytes(8).toString('hex').toUpperCase()}`, type, date: body.date, time: body.time, durationMinutes, status: 'confirmed', name, email, notes, createdAt: current.toISOString(), tokenHash: hashToken(managementToken) };
          store.bookings.push(booking);
          writeStore(storageFile, store);
          json(201, { booking: publicBooking(booking), managementToken }); return;
        }
        const match = url.pathname.match(/^\/api\/schedule\/bookings\/(EG-[A-F0-9]{16})(?:\/(cancel|reschedule))?$/);
        if (match && ((request.method === 'GET' && !match[2]) || (request.method === 'POST' && match[2]))) {
          // Parse any reschedule body before the synchronous read/check/write mutation.
          const body = match[2] === 'reschedule' ? await readJson(request) : null;
          const store = readStore(storageFile);
          const booking = store.bookings.find(record => record.reference === match[1]);
          if (!booking) throw new ApiError(404, 'NOT_FOUND', 'This appointment could not be found.');
          authorize(request, booking);
          if (match[2] === 'cancel') {
            if (booking.status !== 'cancelled') { booking.status = 'cancelled'; booking.updatedAt = now().toISOString(); writeStore(storageFile, store); }
          } else if (match[2] === 'reschedule') {
            if (booking.status === 'cancelled') throw new ApiError(409, 'CANCELLED', 'A cancelled appointment cannot be rescheduled. Please book a new appointment.');
            validateSlot(body.date, body.time, booking.durationMinutes, now(), store.bookings, booking.reference);
            booking.date = body.date; booking.time = body.time; booking.updatedAt = now().toISOString();
            writeStore(storageFile, store);
          }
          json(200, { booking: publicBooking(booking) }); return;
        }
        throw new ApiError(404, 'NOT_FOUND', 'This booking endpoint could not be found.');
      }
      if (!['GET', 'HEAD'].includes(request.method) || !publicDirectory) throw new ApiError(404, 'NOT_FOUND', 'This page could not be found.');
      let pathname;
      try { pathname = decodeURIComponent(url.pathname); } catch { throw new ApiError(400, 'INVALID_PATH', 'This page address is invalid.'); }
      if (pathname.includes('\\') || pathname.includes('\0') || pathname.split('/').some(part => part === '..' || part.startsWith('.'))) throw new ApiError(404, 'NOT_FOUND', 'This page could not be found.');
      let filename = path.resolve(publicDirectory, `.${pathname}`);
      if (filename !== publicDirectory && !filename.startsWith(`${publicDirectory}${path.sep}`)) throw new ApiError(404, 'NOT_FOUND', 'This page could not be found.');
      if (!existsSync(filename) || !statSync(filename).isFile()) {
        if (path.extname(pathname)) throw new ApiError(404, 'NOT_FOUND', 'This file could not be found.');
        filename = path.join(publicDirectory, 'index.html');
      }
      if (!existsSync(filename) || !statSync(filename).isFile()) throw new ApiError(404, 'NOT_FOUND', 'This page could not be found.');
      response.writeHead(200, { 'Content-Type': MIME[path.extname(filename)] ?? 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': path.extname(filename) === '.html' ? 'no-cache' : 'public, max-age=3600' });
      response.end(request.method === 'HEAD' ? undefined : readFileSync(filename));
    } catch (error) {
      const known = error instanceof ApiError;
      if (!known) console.error('Booking service request failed:', error?.message ?? 'Unknown error');
      if (!response.headersSent) json(known ? error.status : 503, { error: known ? error.message : 'The booking calendar is temporarily unavailable. Please try again later.', code: known ? error.code : 'SERVICE_UNAVAILABLE' });
      else response.end();
    }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = createScheduleServer({ dataFile: process.env.SCHEDULE_DATA_FILE || path.resolve('data/appointments.json'), distDir: path.resolve('dist'), allowedOrigins: (process.env.SCHEDULE_ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean) });
  const port = Number(process.env.PORT || 8787);
  const host = process.env.HOST || '127.0.0.1';
  server.listen(port, host, () => console.log(`Booking service listening on http://${host}:${port}`));
  const stop = () => server.close(() => process.exit(0));
  process.on('SIGINT', stop); process.on('SIGTERM', stop);
}
