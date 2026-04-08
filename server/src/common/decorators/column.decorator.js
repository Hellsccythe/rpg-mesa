import { columnRegistry } from "./_metadata.js";
/**
 * Mapeia uma propriedade da classe à coluna do banco de dados.
 *
 * @example
 * @Column({ name: "user_id" })
 * userId!: string;
 *
 * @Column({ name: "campaign_id", nullable: true })
 * campaignId!: string | null;
 */
export function Column(options) {
    return function (target, propertyKey) {
        const ctor = target.constructor;
        const existing = columnRegistry.get(ctor) ?? [];
        existing.push({
            dbColumn: options.name,
            propertyKey,
            nullable: options.nullable ?? false,
        });
        columnRegistry.set(ctor, existing);
    };
}
//# sourceMappingURL=column.decorator.js.map