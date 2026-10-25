const { test } = require('node:test');
const assert = require('node:assert/strict');
const { computeConsensus, samples } = require('../assets/workbench.js');

test('default browser sample reproduces the archived CLI ranking and scores', () => {
  const output = computeConsensus(samples.default);
  assert.deepEqual(output.map(row => row.code), ['000003', '000001', '000002']);
  assert.deepEqual(output.map(row => row.score.toFixed(1)), ['83.3', '66.7', '50.0']);
});
test('changing one framework changes the result and uses the CLI tie breakers', () => {
  const output = computeConsensus(samples.momentum);
  assert.deepEqual(output.map(row => row.code), ['000002', '000003', '000001']);
  assert.deepEqual(output.map(row => row.score.toFixed(1)), ['83.3', '83.3', '33.3']);
});
test('tied raw scores use average ranks rather than arbitrary input order', () => {
  const output = computeConsensus(samples.tied);
  assert.equal(output.find(row => row.code === '000001').qualityPct, 50);
  assert.equal(output.find(row => row.code === '000002').qualityPct, 50);
  assert.deepEqual(output.map(row => row.score.toFixed(1)), ['83.3', '75.0', '41.7']);
});
test('constant three-row frameworks have the pandas average-rank percentile', () => {
  const rows = ['000003', '000001', '000002'].map(code => ({ code, quality: 0, momentum: 0 }));
  const output = computeConsensus(rows);
  assert.deepEqual(output.map(row => row.code), ['000001', '000002', '000003']);
  output.forEach(row => assert.ok(Math.abs(row.score - 200 / 3) < 1e-10));
});
test('missing and non-finite framework scores are rejected', () => {
  for (const quality of [undefined, null, NaN, Infinity, '10']) {
    assert.throws(() => computeConsensus([{ code: '000001', quality, momentum: 1 }]));
  }
  assert.throws(() => computeConsensus([])); assert.throws(() => computeConsensus(null));
});
test('ambiguous or non-string codes are rejected', () => {
  assert.throws(() => computeConsensus([samples.default[0], samples.default[0]]));
  for (const code of [123456, '1', 'abc123', '000001 ', '１２３４５６']) {
    assert.throws(() => computeConsensus([{ code, quality: 1, momentum: 1 }]));
  }
});
test('the calculation accepts frozen input and does not rewrite the sample', () => {
  const rows = Object.freeze(samples.default.map(row => Object.freeze({ ...row })));
  const before = JSON.stringify(rows); computeConsensus(rows);
  assert.equal(JSON.stringify(rows), before);
});
test('rank normalization depends on ordering, not the scale of raw scores', () => {
  const scaled = samples.default.map(row => ({ ...row, quality: row.quality * 1000 - 50000, momentum: row.momentum / 100 }));
  assert.deepEqual(computeConsensus(scaled).map(row => [row.code, row.score]), computeConsensus(samples.default).map(row => [row.code, row.score]));
});
