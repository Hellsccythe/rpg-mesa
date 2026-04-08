import { tableRegistry, columnRegistry } from "./_metadata.js";
/**
 * Retorna o nome da tabela registrado via @Table.
 * Lança erro se o decorator não foi aplicado.
 */
export function getTableName(target) {
    const name = tableRegistry.get(target);
    if (!name) {
        throw new Error(`@Table decorator não encontrado em ${target.name}`);
    }
    return name;
}
/**
 * Retorna a string de campos para usar no .select() do Supabase,
 * gerada automaticamente a partir dos @Column da classe.
 *
 * Exemplo de saída: "id, user_id, campaign_id, name, level"
 */
export function getSelectFields(target) {
    const columns = columnRegistry.get(target) ?? [];
    if (columns.length === 0) {
        throw new Error(`Nenhum @Column encontrado em ${target.name}`);
    }
    return columns.map((c) => c.dbColumn).join(", ");
}
/**
 * Mapeia uma linha retornada pelo banco (snake_case) para o objeto
 * de entidade (camelCase), usando os metadados dos @Column.
 */
export function mapFromRow(target, row) {
    const columns = columnRegistry.get(target) ?? [];
    const result = {};
    for (const col of columns) {
        result[col.propertyKey] = row[col.dbColumn] ?? null;
    }
    return result;
}
//# sourceMappingURL=model.helpers.js.map