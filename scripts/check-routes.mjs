import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const appDirectory = path.join(projectRoot, 'app');
const baseUrl = process.env.ROUTE_TEST_URL || 'http://localhost:3000';
const sampleId = process.env.ROUTE_TEST_ID || '00000000-0000-4000-8000-000000000000';

const findRoutes = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const routes = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      routes.push(...await findRoutes(entryPath));
    } else if (entry.name === 'page.tsx') {
      const segments = path.relative(appDirectory, directory).split(path.sep);
      const routeSegments = segments
        .filter((segment) => segment && !segment.startsWith('('))
        .map((segment) => segment === '[id]' ? sampleId : segment);

      routes.push('/' + routeSegments.join('/'));
    }
  }

  return routes;
};

const checkRoute = async (route) => {
  try {
    const response = await fetch(new URL(route, baseUrl), {
      signal: AbortSignal.timeout(60000),
    });
    const html = await response.text();
    const hasError = html.includes('id="__next_error__"');
    const passed = response.ok && !hasError;

    console.log(`${passed ? 'PASS' : 'FAIL'} ${response.status} ${route}`);
    return passed;
  } catch (error) {
    console.log(`FAIL ${route}: ${error.message}`);
    return false;
  }
};

const routes = (await findRoutes(appDirectory)).sort();
const results = [];

for (let index = 0; index < routes.length; index += 3) {
  const batch = routes.slice(index, index + 3);
  results.push(...await Promise.all(batch.map(checkRoute)));
}

const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${routes.length} routes passed HTTP and server-render checks.`);
console.log('These checks do not execute browser JavaScript or test signed-in actions.');
process.exitCode = passed === routes.length ? 0 : 1;
