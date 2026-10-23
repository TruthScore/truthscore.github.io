/** Id of the inline error message rendered under the field with id `fieldId`. */
export const errorId = (fieldId: string) => `${fieldId}-error`;

/** aria props tying a field to its inline error; both undefined when the field is valid. */
export const fieldA11y = (fieldId: string, error: string | undefined) => ({
  'aria-invalid': error ? (true as const) : undefined,
  'aria-describedby': error ? errorId(fieldId) : undefined,
});
