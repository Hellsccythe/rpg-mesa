// Internal metadata storage for @Table and @Column decorators.
// Uses WeakMap so class references are garbage-collected when no longer needed.

export interface ColumnMeta {
  dbColumn: string;
  propertyKey: string;
  nullable: boolean;
}

export const tableRegistry = new WeakMap<Function, string>();
export const columnRegistry = new WeakMap<Function, ColumnMeta[]>();
