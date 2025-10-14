import { describe, it, expect } from 'vitest';
import { isTodoArray, type Todo } from './utils';

describe('isTodoArray', () => {
  it('should return true for a valid array of todos', () => {
    const validData: Todo[] = [
      { id: 1, title: 'Test Todo', created_at: new Date().toISOString() },
    ];
    expect(isTodoArray(validData)).toBe(true);
  });

  it('should return true for an empty array', () => {
    const emptyData: Todo[] = [];
    expect(isTodoArray(emptyData)).toBe(true);
  });

  it('should return false if created_at is missing', () => {
    const invalidData = [{ id: 1, title: 'Missing date' }];
    expect(isTodoArray(invalidData)).toBe(false);
  });

  it('should return false if id is not a number', () => {
    const invalidData = [{ id: '1', title: 'String ID', created_at: 'date' }];
    expect(isTodoArray(invalidData)).toBe(false);
  });

  it('should return false for non-array inputs', () => {
    expect(isTodoArray(null)).toBe(false);
    expect(isTodoArray({})).toBe(false);
    expect(isTodoArray("string")).toBe(false);
  });
});