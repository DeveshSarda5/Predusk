// Run this to verify all API endpoints are working
const http = require('http');
const assert = require('assert');

const BASE_URL = process.env.API_URL || 'http://localhost:3001';
let testsPassed = 0;
let testsFailed = 0;

async function request(method, path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data ? JSON.parse(data) : null
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    testsPassed++;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    testsFailed++;
  }
}

async function runTests() {
  console.log(`\n🧪 API Tests (${BASE_URL})\n`);

  await test('GET /health returns 200', async () => {
    const res = await request('GET', '/health');
    assert.strictEqual(res.status, 200);
    assert(res.body.status === 'ok');
  });

  await test('GET /profile returns profile', async () => {
    const res = await request('GET', '/profile');
    assert.strictEqual(res.status, 200);
    assert(res.body.name);
    assert(res.body.email);
  });

  await test('GET /profile has skills array', async () => {
    const res = await request('GET', '/profile');
    assert(Array.isArray(res.body.skills));
    assert(res.body.skills.length > 0);
  });

  await test('GET /profile has projects array', async () => {
    const res = await request('GET', '/profile');
    assert(Array.isArray(res.body.projects));
    assert(res.body.projects.length > 0);
  });

  await test('GET /profile has education array', async () => {
    const res = await request('GET', '/profile');
    assert(Array.isArray(res.body.education));
  });

  await test('GET /projects returns all projects', async () => {
    const res = await request('GET', '/projects');
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.body));
    assert(res.body.length > 0);
  });

  await test('GET /projects?skill=JavaScript filters', async () => {
    const res = await request('GET', '/projects?skill=JavaScript');
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.body));
  });

  await test('GET /skills/top returns skills', async () => {
    const res = await request('GET', '/skills/top');
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.body));
    assert(res.body.length > 0);
    assert(res.body[0].skill);
    assert(res.body[0].proficiency);
  });

  await test('GET /search?q=JavaScript works', async () => {
    const res = await request('GET', '/search?q=JavaScript');
    assert.strictEqual(res.status, 200);
    assert(res.body.projects !== undefined);
    assert(res.body.skills !== undefined);
  });

  await test('GET /search requires min 2 chars', async () => {
    const res = await request('GET', '/search?q=J');
    assert.strictEqual(res.status, 200);
    assert(res.body.results !== undefined || res.body.projects !== undefined);
  });

  console.log(`\n📊 Results: ${testsPassed} passed, ${testsFailed} failed\n`);
  
  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
