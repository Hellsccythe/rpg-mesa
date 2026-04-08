// Internal metadata storage for @Table and @Column decorators.
// Uses WeakMap so class references are garbage-collected when no longer needed.
export const tableRegistry = new WeakMap();
export const columnRegistry = new WeakMap();
//# sourceMappingURL=_metadata.js.map