// ── Test environment setup ─────────────────────────────────────────────────────
// This file runs in `setupFiles` — BEFORE Jest framework globals are available.
// Only plain JS is allowed here (no beforeAll, afterAll, jest.fn() etc.)

process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET   = 'test-jwt-secret-for-unit-tests';
process.env.JWT_EXPIRY   = '1d';
process.env.NODE_ENV     = 'test';

// Silence console.log/info during tests via direct override
// (no Jest globals needed — simple plain-JS suppression)
const originalLog  = console.log.bind(console);
const originalInfo = console.info.bind(console);

console.log  = (...args: any[]) => {
  // Allow explicit [TEST] prefixed logs to pass through for debugging
  if (typeof args[0] === 'string' && args[0].startsWith('[TEST]')) {
    originalLog(...args);
  }
};
console.info = (...args: any[]) => {
  if (typeof args[0] === 'string' && args[0].startsWith('[TEST]')) {
    originalInfo(...args);
  }
};
