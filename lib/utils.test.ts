import { describe, it, expect } from 'vitest';

// Impordime testimiseks nii funktsiooni kui ka tüübi
import { isNoteArray, type Note } from './utils';

describe('isNoteArray', () => {

  it('should return true for a valid array of notes', () => {
    // Anname testandmetele korrektse tüübi
    const validData: Note[] = [{ id: 1, title: 'Test Note' }];
    expect(isNoteArray(validData)).toBe(true);
  });

  it('should return true for an empty array', () => {
    // Parandatud rida: anname tühjale massiivile korrektse tüübi
    const emptyData: Note[] = [];
    expect(isNoteArray(emptyData)).toBe(true);
  });

  it('should return false for an array with incorrect object keys', () => {
    const invalidData = [{ id: 1, name: 'Wrong Property' }]; // 'name' instead of 'title'
    expect(isNoteArray(invalidData)).toBe(false);
  });

  it('should return false for an array where id is not a number', () => {
    const mixedData = [{ id: '1', title: 'ID is a string' }];
    expect(isNoteArray(mixedData)).toBe(false);
  });

  it('should return false for non-array inputs', () => {
    expect(isNoteArray(null)).toBe(false);
    expect(isNoteArray(undefined)).toBe(false);
    expect(isNoteArray({})).toBe(false);
    expect(isNoteArray("I am a string")).toBe(false);
    expect(isNoteArray(123)).toBe(false);
  });

});