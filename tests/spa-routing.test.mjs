import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, writeFile, rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createScheduleServer} from '../server/schedule-server.mjs';

test('standard frontend URLs support direct loading, queries and refresh without intercepting API or asset requests', async t => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'godswill-spa-routing-'));
  const html = '<!doctype html><title>Godswill</title><div id="root"></div>';
  await writeFile(path.join(directory, 'index.html'), html);
  const server = createScheduleServer({distDir: directory, dataFile: path.join(directory, 'appointments.json')});
  t.after(async () => {
    await new Promise(resolve => {server.close(resolve); server.closeAllConnections();});
    await rm(directory, {recursive: true, force: true});
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const route of ['/speaking', '/courses?format=cohort', '/engineering/projects/my-lpg-hub', '/dashboard/bookings/']) {
    const response = await fetch(`${base}${route}`);
    assert.equal(response.status, 200, route);
    assert.match(response.headers.get('content-type'), /text\/html/);
    assert.equal(await response.text(), html);
    assert.equal((await fetch(`${base}${route}`, {method: 'HEAD'})).status, 200);
  }
  for (const route of ['/api/unknown', '/assets/missing.js']) {
    const response = await fetch(`${base}${route}`);
    assert.equal(response.status, 404, route);
    assert.match(response.headers.get('content-type'), /application\/json/);
  }
});
