import axios, { AxiosResponse } from 'axios';

const BASE_URL = 'http://localhost:3000';
const TEST_OPENID = 'test_user_api';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
});

client.interceptors.request.use((config) => {
  config.headers['X-Wechat-Openid'] = TEST_OPENID;
  return config;
});

interface ApiResponse<T = any> {
  code: number;
  message?: string;
  data?: T;
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ Assertion failed: ${message}`);
  }
  console.log(`✅ ${message}`);
}

async function testHealth() {
  console.log('\n=== 1. Health Check ===');
  const res = await client.get('/health');
  assert(res.status === 200, 'Health check returns 200');
  assert(res.data.status === 'ok', 'Health status is ok');
}

async function testWechatSignature() {
  console.log('\n=== 2. Wechat Signature Verification ===');
  const res = await client.get('/wechat', {
    params: {
      signature: 'test',
      timestamp: '123',
      nonce: '456',
      echostr: 'test123',
    },
  });
  assert(res.status === 200, 'Wechat GET returns 200');
}

async function testWechatPost() {
  console.log('\n=== 3. Wechat POST (XML Message) ===');
  const xml = `<xml>
<ToUserName><![CDATA[gh_test]]></ToUserName>
<FromUserName><![CDATA[oTest123]]></FromUserName>
<CreateTime>1234567890</CreateTime>
<MsgType><![CDATA[text]]></MsgType>
<Content><![CDATA[帮助]]></Content>
<MsgId>123456</MsgId>
</xml>`;

  const res = await client.post('/wechat', xml, {
    headers: { 'Content-Type': 'text/xml' },
  });
  assert(res.status === 200, 'Wechat POST returns 200');
  assert(res.data.includes('<Content>'), 'Response contains Content');
}

async function testUser() {
  console.log('\n=== 4. User API ===');

  const getRes = await client.get('/api/users/me');
  assert(getRes.status === 200, 'GET /api/users/me returns 200');
  assert(getRes.data.openid === TEST_OPENID, 'User openid matches');
  console.log(`   User ID: ${getRes.data.id}`);

  const updateRes = await client.put('/api/users/me', {
    nickname: '测试用户',
    grade: 2,
    subjects: ['math', 'english'],
  });
  assert(updateRes.status === 200, 'PUT /api/users/me returns 200');
  assert(updateRes.data.nickname === '测试用户', 'Nickname updated');
  assert(updateRes.data.grade === 2, 'Grade updated');
}

async function testQuestions() {
  console.log('\n=== 5. Questions API ===');

  const createRes = await client.post('/api/questions', {
    questionText: '已知函数f(x)=x^2+2x,求f(3)',
    subject: 'math',
    knowledgePoint: '二次函数',
  });
  assert(createRes.status === 200, 'POST /api/questions returns 200');
  const questionId = createRes.data.id;
  console.log(`   Created question ID: ${questionId}`);

  const listRes = await client.get('/api/questions');
  assert(listRes.status === 200, 'GET /api/questions returns 200');
  assert(listRes.data.items.length > 0, 'Questions list not empty');
  assert(listRes.data.total >= 1, 'Total count >= 1');

  const weakRes = await client.get('/api/questions/weak-points');
  assert(weakRes.status === 200, 'GET /api/questions/weak-points returns 200');
  assert(weakRes.data.weakPoints.length > 0, 'Weak points found');

  const markRes = await client.post(`/api/questions/${questionId}/master`);
  assert(markRes.status === 200, 'POST /api/questions/:id/master returns 200');
  assert(markRes.data.status === 'mastered', 'Question status is mastered');
}

async function testPlans() {
  console.log('\n=== 6. Plans API ===');

  const getTodayRes = await client.get('/api/plans/today');
  assert(getTodayRes.status === 200, 'GET /api/plans/today returns 200');

  const generateRes = await client.post('/api/plans/generate', {
    availableMinutes: 60,
  });
  assert(generateRes.status === 200, 'POST /api/plans/generate returns 200');
  assert(generateRes.data.id, 'Plan has ID');
  assert(Array.isArray(generateRes.data.items), 'Plan has items array');
  console.log(`   Plan items: ${generateRes.data.items?.length || 0}`);

  if (generateRes.data.items?.length > 0) {
    const itemId = generateRes.data.items[0].id;
    const completeRes = await client.put(`/api/plans/items/${itemId}/complete`, {
      completedCount: 1,
      actualMinutes: 10,
    });
    assert(completeRes.status === 200, 'PUT /api/plans/items/:id/complete returns 200');
  }

  const summaryRes = await client.get('/api/plans/summary');
  assert(summaryRes.status === 200, 'GET /api/plans/summary returns 200');
  assert(summaryRes.data.summary, 'Summary exists');
}

async function testTomato() {
  console.log('\n=== 7. Tomato Clock API ===');

  const startRes = await client.post('/api/plans/tomato/start', {
    subject: 'math',
  });
  assert(startRes.status === 200, 'POST /api/plans/tomato/start returns 200');
  assert(startRes.data.tomatoId, 'Tomato has ID');
  const tomatoId = startRes.data.tomatoId;

  const completeRes = await client.post(`/api/plans/tomato/${tomatoId}/complete`, {
    result: 'completed',
  });
  assert(completeRes.status === 200, 'POST /api/plans/tomato/:id/complete returns 200');
  assert(completeRes.data.totalTomatoesToday >= 1, 'Total tomatoes >= 1');
}

async function testAI() {
  console.log('\n=== 8. AI API ===');

  const chatRes = await client.post('/api/ai/chat', {
    message: '今天考试考砸了，心情不好',
    type: 'emotional',
  });
  assert(chatRes.status === 200, 'POST /api/ai/chat returns 200');
  assert(chatRes.data.reply, 'AI reply exists');
  assert(chatRes.data.detectedEmotion, 'Emotion detected');
  console.log(`   Detected emotion: ${chatRes.data.detectedEmotion}`);
}

async function testEmotional() {
  console.log('\n=== 9. Emotional API ===');

  const chatRes = await client.post('/api/emotional/chat', {
    message: '学不进去了，好累',
  });
  assert(chatRes.status === 200, 'POST /api/emotional/chat returns 200');
  assert(chatRes.data.emotion, 'Emotion detected');
  assert(chatRes.data.reply, 'Reply exists');
  assert(Array.isArray(chatRes.data.suggestions), 'Suggestions array exists');

  const motivateRes = await client.post('/api/emotional/motivate');
  assert(motivateRes.status === 200, 'POST /api/emotional/motivate returns 200');
  assert(motivateRes.data.reply, 'Motivation reply exists');
}

async function testMember() {
  console.log('\n=== 10. Member API ===');

  const infoRes = await client.get('/api/membership');
  assert(infoRes.status === 200, 'GET /api/membership returns 200');
  assert(infoRes.data.level === 'free', 'Default level is free');
  console.log(`   Membership level: ${infoRes.data.level}`);

  const productsRes = await client.get('/api/membership/products');
  assert(productsRes.status === 200, 'GET /api/membership/products returns 200');
  assert(Array.isArray(productsRes.data), 'Products is array');
  assert(productsRes.data.length >= 3, 'At least 3 products');
}

async function testParent() {
  console.log('\n=== 11. Parent API ===');

  const bindCodeRes = await client.get('/api/parent/bind-code');
  assert(bindCodeRes.status === 200, 'GET /api/parent/bind-code returns 200');
  assert(bindCodeRes.data.bindCode, 'Bind code exists');
  console.log(`   Bind code: ${bindCodeRes.data.bindCode}`);
}

async function runTests() {
  console.log('========================================');
  console.log('       Study Agent API Test Suite       ');
  console.log('========================================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test Openid: ${TEST_OPENID}`);

  const tests = [
    { name: 'Health', fn: testHealth },
    { name: 'Wechat Signature', fn: testWechatSignature },
    { name: 'Wechat POST', fn: testWechatPost },
    { name: 'User', fn: testUser },
    { name: 'Questions', fn: testQuestions },
    { name: 'Plans', fn: testPlans },
    { name: 'Tomato', fn: testTomato },
    { name: 'AI', fn: testAI },
    { name: 'Emotional', fn: testEmotional },
    { name: 'Member', fn: testMember },
    { name: 'Parent', fn: testParent },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      await test.fn();
      passed++;
    } catch (error: any) {
      console.log(`❌ ${test.name}: ${error.message}`);
      failed++;
    }
  }

  console.log('\n========================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('========================================');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((error) => {
  console.error('Test suite error:', error);
  process.exit(1);
});
