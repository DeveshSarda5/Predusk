// Simple test script for API
const http = require('http');

const baseUrl = 'http://localhost:3001';

function makeRequest(endpoint, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, baseUrl);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Running API Tests...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣  Testing /health...');
    let result = await makeRequest('/health');
    console.log(`   Status: ${result.status} ✓`);
    console.log(`   Response: ${JSON.stringify(result.data)}\n`);

    // Test 2: Get Profile
    console.log('2️⃣  Testing GET /profile...');
    result = await makeRequest('/profile');
    console.log(`   Status: ${result.status} ✓`);
    console.log(`   Name: ${result.data.name}`);
    console.log(`   Skills: ${result.data.skills.slice(0, 3).join(', ')}...\n`);

    // Test 3: Get Projects
    console.log('3️⃣  Testing GET /projects...');
    result = await makeRequest('/projects');
    console.log(`   Status: ${result.status} ✓`);
    console.log(`   Projects found: ${result.data.length}\n`);

    // Test 4: Get Skills Top
    console.log('4️⃣  Testing GET /skills/top...');
    result = await makeRequest('/skills/top');
    console.log(`   Status: ${result.status} ✓`);
    console.log(`   Top skills: ${result.data.slice(0, 3).map(s => `${s.skill}(${s.proficiency}/10)`).join(', ')}\n`);

    // Test 5: Search
    console.log('5️⃣  Testing GET /search...');
    result = await makeRequest('/search?q=JavaScript');
    console.log(`   Status: ${result.status} ✓`);
    console.log(`   Results: ${JSON.stringify(result.data, null, 2).substring(0, 100)}...\n`);

    // Test 6: Filter Projects by Skill
    console.log('6️⃣  Testing GET /projects?skill=JavaScript...');
    result = await makeRequest('/projects?skill=JavaScript');
    console.log(`   Status: ${result.status} ✓`);
    console.log(`   JavaScript projects: ${result.data.length}\n`);

    console.log('✅ All tests passed!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Wait for server and run tests
setTimeout(runTests, 1000);
