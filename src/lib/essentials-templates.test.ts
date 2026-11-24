import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateDefaultChecklist,
  getChecklistStats,
  getTripTypeMeta,
  TRIP_TYPES,
  CHECKLIST_CATEGORIES,
} from './essentials-templates.ts';
import type { ChecklistItem } from '../types/trip.ts';

describe('essentials-templates', () => {
  it('defines 4 trip types with full metadata', () => {
    assert.equal(TRIP_TYPES.length, 4);
    const types = TRIP_TYPES.map((t) => t.type);
    assert.deepEqual(types, ['day_hike', 'night_camp', 'short_trek', 'long_trek']);
  });

  it('generates non-empty default checklists for all 4 trip types', () => {
    for (const meta of TRIP_TYPES) {
      const list = generateDefaultChecklist(meta.type);
      assert.ok(list.length > 0, `Expected items for ${meta.type}`);
      assert.ok(list.every((item) => item.id && item.name && item.category));
      assert.ok(list.every((item) => item.isChecked === false));
      assert.ok(list.every((item) => item.isCustom === false));
    }
  });

  it('day hike checklist has expected day hike items and no tent', () => {
    const dayHike = generateDefaultChecklist('day_hike');
    assert.ok(dayHike.some((item) => item.name.includes('Daypack')));
    assert.ok(dayHike.some((item) => item.name.includes('Offline Maps')));
    assert.ok(!dayHike.some((item) => item.name.toLowerCase().includes('tent')));
  });

  it('night camp checklist includes tent, sleeping gear, and utensils', () => {
    const nightCamp = generateDefaultChecklist('night_camp');
    assert.ok(nightCamp.some((item) => item.name.includes('Tent')));
    assert.ok(nightCamp.some((item) => item.name.includes('Dekchi')));
    assert.ok(nightCamp.some((item) => item.name.includes('Music System')));
  });

  it('long trek checklist includes altitude medicine and heavy gear', () => {
    const longTrek = generateDefaultChecklist('long_trek');
    assert.ok(longTrek.some((item) => item.name.includes('Diamox')));
    assert.ok(longTrek.some((item) => item.name.includes('Chhurpi')));
    assert.ok(longTrek.some((item) => item.name.includes('Hiking Sticks')));
  });

  it('correctly calculates checklist stats', () => {
    const items: ChecklistItem[] = [
      { id: '1', name: 'Item 1', category: 'wearables', isChecked: true },
      { id: '2', name: 'Item 2', category: 'wearables', isChecked: false },
      { id: '3', name: 'Item 3', category: 'food', isChecked: true },
      { id: '4', name: 'Item 4', category: 'health', isChecked: false },
    ];
    const stats = getChecklistStats(items);
    assert.equal(stats.total, 4);
    assert.equal(stats.packed, 2);
    assert.equal(stats.pending, 2);
    assert.equal(stats.percentage, 50);

    const emptyStats = getChecklistStats([]);
    assert.equal(emptyStats.total, 0);
    assert.equal(emptyStats.percentage, 0);
  });

  it('provides fallback for unknown trip type', () => {
    // @ts-expect-error testing invalid type
    const fallback = getTripTypeMeta('unknown_type');
    assert.equal(fallback.type, 'long_trek');
  });

  it('contains valid categories', () => {
    assert.ok(CHECKLIST_CATEGORIES.length >= 10);
    assert.ok(CHECKLIST_CATEGORIES.some((c) => c.id === 'wearables'));
    assert.ok(CHECKLIST_CATEGORIES.some((c) => c.id === 'first_aid'));
    assert.ok(CHECKLIST_CATEGORIES.some((c) => c.id === 'hi_protein'));
  });
});
