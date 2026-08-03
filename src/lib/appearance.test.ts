import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_APPEARANCE, getThemePreset, normalizeAppearance, parseStoredAppearance } from './appearance.ts';

test('appearance defaults are the readable dark luxury selection', () => {
  assert.deepEqual(parseStoredAppearance(null), DEFAULT_APPEARANCE);
  assert.equal(getThemePreset(DEFAULT_APPEARANCE.presetId).name, 'Slate Pro');
  assert.equal(DEFAULT_APPEARANCE.surfaceStyle, 'material');
  assert.equal(DEFAULT_APPEARANCE.pattern, 'mesh');
});

test('appearance normalization preserves valid independent axes', () => {
  const result = normalizeAppearance({
    presetId: 'paper', surfaceStyle: 'neumorphic', pattern: 'dots', fontStyle: 'editorial',
    reducedMotion: true, lastDarkPresetId: 'midnight', lastLightPresetId: 'mist',
  });
  assert.equal(result.presetId, 'paper');
  assert.equal(result.surfaceStyle, 'neumorphic');
  assert.equal(result.pattern, 'dots');
  assert.equal(result.fontStyle, 'editorial');
  assert.equal(result.reducedMotion, true);
  assert.equal(result.lastDarkPresetId, 'midnight');
  assert.equal(result.lastLightPresetId, 'mist');
});

test('invalid appearance fields fall back independently', () => {
  const result = normalizeAppearance({
    presetId: 'unknown', surfaceStyle: 'glass', pattern: 'stars', fontStyle: 'comic',
    reducedMotion: 'yes', lastDarkPresetId: 'paper', lastLightPresetId: 'slate',
  });
  assert.deepEqual(result, DEFAULT_APPEARANCE);
  assert.deepEqual(parseStoredAppearance('{bad json'), DEFAULT_APPEARANCE);
});
