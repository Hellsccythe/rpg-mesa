import { api } from '@/plugins/axios'

export type DialetoSql = 'postgresql' | 'mysql' | 'sqlite'

export async function exportarSchemaSql(dialeto: DialetoSql = 'postgresql'): Promise<void> {
  const { data } = await api.get<string>('/admin/exportar-schema', {
    responseType: 'text',
    params: { dialeto },
  })
  const blob = new Blob([data], { type: 'text/plain;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `schema_${dialeto}_${new Date().toISOString().slice(0, 10)}.sql`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
