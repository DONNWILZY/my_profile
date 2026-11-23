import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createScheduleServer } from '../server/schedule-server.mjs';

const NOW = new Date('2026-11-23T07:00:00.000Z'); // Monday, 08:00 in Lagos.
const sample = { type: 'Discovery call', date: '2026-11-24', time: '09:00', name: 'A learner', email: 'learner@example.com', notes: 'Discuss a project.' };

async function fixture(t, options = {}) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'godswill-schedule-'));
  const dataFile = path.join(directory, 'appointments.json');
  let server;
  let base;
  async function start() {
    server = createScheduleServer({ dataFile, now: () => new Date(NOW), ...options });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    base = `http://127.0.0.1:${server.address().port}`;
  }
  async function stop() {
    if (!server?.listening) return;
    await new Promise((resolve, reject) => { server.close(error => error ? reject(error) : resolve()); server.closeAllConnections(); });
  }
  await start();
  t.after(async () => { await stop(); await rm(directory, { recursive: true, force: true }); });
  async function request(endpoint, { body, token, method = body ? 'POST' : 'GET', headers = {} } = {}) {
    const response = await fetch(`${base}${endpoint}`, { method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers }, ...(body ? { body: JSON.stringify(body) } : {}) });
    const json = await response.json();
    return { status: response.status, json, headers: response.headers };
  }
  return { dataFile, directory, request, restart: async () => { await stop(); await start(); } };
}
const availabilityPath = '/api/schedule/availability?month=2026-11';
const bookingPath = '/api/schedule/bookings';

test('a fresh calendar publishes rules and no fabricated appointments', async t => {
  const { request } = await fixture(t);
  const result = await request(availabilityPath);
  assert.equal(result.status, 200);
  assert.equal(result.json.timezone, 'Africa/Lagos');
  assert.equal(result.json.serverNow, NOW.toISOString());
  assert.deepEqual(result.json.busy, []);
  assert.equal(result.headers.get('cache-control'), 'no-store');
  assert.equal((await request('/api/schedule/availability?month=2026-13')).status, 400);
});

test('concurrent booking attempts reserve a slot only once and protect personal data', async t => {
  const { request, dataFile } = await fixture(t);
  const responses = await Promise.all([
    request(bookingPath, { body: sample }),
    request(bookingPath, { body: { ...sample, name: 'Another learner', email: 'other@example.com' } }),
  ]);
  assert.deepEqual(responses.map(response => response.status).sort(), [201, 409]);
  const result = responses.find(response => response.status === 201).json;
  assert.equal(result.booking.status, 'confirmed');
  assert.equal(result.managementToken.length, 64);
  assert.equal(result.booking.tokenHash, undefined);
  const store = JSON.parse(await readFile(dataFile, 'utf8'));
  assert.equal(store.bookings.length, 1);
  assert.equal(store.bookings[0].managementToken, undefined);
  assert.notEqual(store.bookings[0].tokenHash, result.managementToken);
  const availability = await request(availabilityPath);
  assert.deepEqual(availability.json.busy, [{ date: sample.date, start: '09:00', end: '09:30' }]);
  assert.equal(JSON.stringify(availability.json).includes('learner@example.com'), false);
  assert.equal(JSON.stringify(availability.json).includes('reference'), false);
  assert.equal(JSON.stringify(availability.json).includes('token'), false);
});

test('duration overlaps are blocked across appointment types, while adjacent times remain available', async t => {
  const { request } = await fixture(t);
  assert.equal((await request(bookingPath, { body: { ...sample, type: 'Software consultation' } })).status, 201);
  assert.equal((await request(bookingPath, { body: { ...sample, time: '09:30' } })).status, 409);
  assert.equal((await request(bookingPath, { body: { ...sample, time: '08:30' } })).status, 400);
  assert.equal((await request(bookingPath, { body: { ...sample, time: '10:00' } })).status, 201);
  assert.deepEqual((await request(availabilityPath)).json.busy, [
    { date: sample.date, start: '09:00', end: '10:00' },
    { date: sample.date, start: '10:00', end: '10:30' },
  ]);
});

test('validates service, date, lead time, horizon, business hours, grid and personal fields', async t => {
  const { request } = await fixture(t);
  const invalid = [
    { type: 'Unknown' }, { date: '2026-11-31' }, { date: '2026-11-28' },
    { date: '2026-11-23', time: '09:30' }, { date: '2027-03-01' },
    { time: '09:15' }, { time: '17:00' }, { type: 'Marketing consultation', time: '16:30' },
    { email: 'not-an-email' }, { name: '' }, { name: 'x'.repeat(101) }, { notes: 'x'.repeat(2001) },
    { date: 123 }, { time: null }, { notes: { nested: 'no' } },
  ];
  for (const patch of invalid) {
    const response = await request(bookingPath, { body: { ...sample, ...patch } });
    assert.equal(response.status, 400, JSON.stringify(patch));
    assert.equal(typeof response.json.error, 'string');
  }
  assert.equal((await request(bookingPath, { body: { ...sample, date: '2026-11-23', time: '10:00' } })).status, 201, 'exactly two hours ahead is accepted');
  assert.equal((await request(availabilityPath)).json.busy.length, 1);
});

test('management token is required, cancellation releases the slot and persists on restart', async t => {
  const { request, restart } = await fixture(t);
  const result = (await request(bookingPath, { body: sample })).json;
  const detailPath = `${bookingPath}/${result.booking.reference}`;
  assert.equal((await request(detailPath)).status, 401);
  assert.equal((await request(detailPath, { token: 'a'.repeat(64) })).status, 401);
  assert.equal((await request(`${detailPath}/cancel`, { method: 'POST' })).status, 401);
  assert.deepEqual((await request(detailPath, { token: result.managementToken })).json.booking, result.booking);
  await restart();
  assert.equal((await request(availabilityPath)).json.busy.length, 1);
  const cancelled = await request(`${detailPath}/cancel`, { method: 'POST', token: result.managementToken });
  assert.equal(cancelled.status, 200);
  assert.equal(cancelled.json.booking.status, 'cancelled');
  assert.equal((await request(availabilityPath)).json.busy.length, 0);
  assert.equal((await request(`${detailPath}/reschedule`, { token: result.managementToken, body: { date: sample.date, time: '10:00' } })).status, 409);
  assert.equal((await request(bookingPath, { body: sample })).status, 201);
  await restart();
  assert.equal((await request(detailPath, { token: result.managementToken })).json.booking.status, 'cancelled');
});

test('rescheduling checks conflicts, excludes its own occupied interval and releases old slots atomically', async t => {
  const { request } = await fixture(t);
  const first = (await request(bookingPath, { body: { ...sample, type: 'Software consultation' } })).json;
  await request(bookingPath, { body: { ...sample, time: '11:00' } });
  const endpoint = `${bookingPath}/${first.booking.reference}/reschedule`;
  assert.equal((await request(endpoint, { body: { date: sample.date, time: '10:00' } })).status, 401);
  assert.equal((await request(endpoint, { token: first.managementToken, body: { date: sample.date, time: '10:30' } })).status, 409);
  const moved = await request(endpoint, { token: first.managementToken, body: { date: sample.date, time: '09:30' } });
  assert.equal(moved.status, 200);
  assert.equal(moved.json.booking.time, '09:30');
  assert.equal((await request(bookingPath, { body: sample })).status, 201, 'the old 09:00 slot was released');
});

test('corrupt or structurally invalid storage fails closed instead of publishing false availability', async t => {
  const { request, dataFile } = await fixture(t);
  for (const data of ['{bad json', JSON.stringify({ version: 1, bookings: [{ date: sample.date }] }), JSON.stringify({ version: 2, bookings: [] })]) {
    await writeFile(dataFile, data);
    assert.equal((await request(availabilityPath)).status, 503);
    assert.equal((await request(bookingPath, { body: sample })).status, 503);
    assert.equal(await readFile(dataFile, 'utf8'), data, 'corrupt data is not overwritten');
  }
});

test('persistence failure never returns a confirmed booking', async t => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'godswill-schedule-unwritable-'));
  const blocker = path.join(directory, 'not-a-directory');
  await writeFile(blocker, 'blocked');
  const { request } = await fixture(t, { dataFile: path.join(blocker, 'appointments.json') });
  t.after(() => rm(directory, { recursive: true, force: true }));
  assert.equal((await request(bookingPath, { body: sample })).status, 503);
});

test('cross-origin API access is rejected unless explicitly configured', async t => {
  const { request } = await fixture(t, { allowedOrigins: ['https://portfolio.example'] });
  assert.equal((await request(availabilityPath, { headers: { Origin: 'https://unknown.example' } })).status, 403);
  const allowed = await request(availabilityPath, { headers: { Origin: 'https://portfolio.example' } });
  assert.equal(allowed.status, 200);
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'https://portfolio.example');
});

test('rejects oversized bodies without creating an appointment', async t => {
  const { request } = await fixture(t);
  const response = await request(bookingPath, { body: { ...sample, notes: 'x'.repeat(18000) } });
  assert.equal(response.status, 413);
  assert.equal((await request(availabilityPath)).json.busy.length, 0);
});

test('production static serving remains inside dist and does not expose the appointment file', async t => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'godswill-schedule-static-'));
  await writeFile(path.join(directory, 'index.html'), '<!doctype html><title>Portfolio</title>');
  const { request } = await fixture(t, { distDir: directory });
  t.after(() => rm(directory, { recursive: true, force: true }));
  assert.equal((await request('/data/appointments.json')).status, 404);
  assert.equal((await request('/server/schedule-server.mjs')).status, 404);
  assert.equal((await request('/%2e%2e%5cserver%5cschedule-server.mjs')).status, 404);
  assert.equal((await request('/.env')).status, 404);
});
