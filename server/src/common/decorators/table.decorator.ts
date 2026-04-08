import { tableRegistry } from "./_metadata.js";

/**
 * Marks a class as a database table entity.
 *
 * @example
 * @Table("characters")
 * class PersonagemModel { ... }
 */
export function Table(tableName: string) {
  return function (target: Function): void {
    tableRegistry.set(target, tableName);
  };
}
