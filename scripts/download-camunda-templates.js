#!/usr/bin/env node

/**
 * Downloads OOTB Camunda connector element templates from the Camunda Marketplace
 * and writes them to test/fixtures/camunda-connector-templates.json.
 *
 * The endpoint returns a map of connector ID -> array of versions, each with a
 * `ref` URL pointing to the actual element template JSON. This script fetches
 * the latest version of each connector and flattens all templates into one array.
 */

const { writeFileSync } = require('node:fs');
const { join } = require('node:path');

const OUTPUT_PATH = join(__dirname, '../test/fixtures/camunda-connector-templates.json');
const ENDPOINT_URL = 'https://marketplace.cloud.camunda.io/api/v1/ootb-connectors';

// Maximum number of parallel ref fetches to avoid rate limiting.
const CONCURRENCY = 5;

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`GET ${url} failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Run tasks with bounded concurrency.
 *
 * @param {Array<() => Promise<any>>} tasks
 * @param {number} concurrency
 * @returns {Promise<any[]>}
 */
async function runWithConcurrency(tasks, concurrency) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const current = index++;
      results[current] = await tasks[current]();
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));

  return results;
}

async function downloadTemplates() {
  console.log(`Fetching connector index from ${ENDPOINT_URL} ...`);

  const index = await fetchJson(ENDPOINT_URL);

  // Pick the entry with the highest version number for each connector.
  const latestRefs = Object.entries(index).map(([ id, versions ]) => {
    const latest = versions.reduce((a, b) => (b.version > a.version ? b : a));

    return { id, ref: latest.ref };
  });

  console.log(`Fetching ${latestRefs.length} connector template(s) ...`);

  const tasks = latestRefs.map(({ id, ref }) => async () => {
    console.log(`  Fetching ${id} ...`);
    const data = await fetchJson(ref);

    // Each ref may resolve to a single template object or an array of templates.
    return Array.isArray(data) ? data : [ data ];
  });

  const results = await runWithConcurrency(tasks, CONCURRENCY);

  const templates = results.flat();

  writeFileSync(OUTPUT_PATH, JSON.stringify(templates, null, 2), 'utf8');

  console.log(`\nSaved ${templates.length} template(s) to ${OUTPUT_PATH}`);
}

downloadTemplates().catch(err => {
  console.error(err.message);
  process.exit(1);
});
