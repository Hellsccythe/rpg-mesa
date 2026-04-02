import { columnRegistry, type ColumnMeta } from "./_metadata.js";

export interface ColumnOptions {
  /** Nome exato da coluna no banco de dados (snake_case). */
  name: string;
  /** Indica se o valor pode ser null no banco. Default: false. */
  nullable?: boolean;
}

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
export function Column(options: ColumnOptions) {
  return function (target: object, propertyKey: string): void {
    const ctor = (target as any).constructor as Function;
    const existing: ColumnMeta[] = columnRegistry.get(ctor) ?? [];
    existing.push({
      dbColumn: options.name,
      propertyKey,
      nullable: options.nullable ?? false,
    });
    columnRegistry.set(ctor, existing);
  };
}
