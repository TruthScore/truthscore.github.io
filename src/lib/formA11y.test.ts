import { describe, it, expect } from 'vitest';
import { errorId, fieldA11y } from './formA11y';

describe('fieldA11y', () => {
  it('marks an invalid field and points it at its own message', () => {
    expect(errorId('support-subject')).toBe('support-subject-error');
    expect(fieldA11y('support-subject', 'Too short')).toEqual({
      'aria-invalid': true, 'aria-describedby': 'support-subject-error',
    });
  });
  it('leaves a valid field unmarked', () => {
    expect(fieldA11y('support-subject', undefined)).toEqual({
      'aria-invalid': undefined, 'aria-describedby': undefined,
    });
  });
});
