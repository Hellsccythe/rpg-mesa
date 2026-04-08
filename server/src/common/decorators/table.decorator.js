import { tableRegistry } from "./_metadata.js";
/**
 * Marks a class as a database table entity.
 *
 * @example
 * @Table("characters")
 * class PersonagemModel { ... }
 */
export function Table(tableName) {
    return function (target) {
        tableRegistry.set(target, tableName);
    };
}
//# sourceMappingURL=table.decorator.js.map