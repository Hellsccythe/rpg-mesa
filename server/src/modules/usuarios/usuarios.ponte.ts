import type { UsuariosService } from "./usuarios.service.js";

/**
 * Ponte temporária entre os módulos Express antigos e os serviços do Nest.
 *
 * Os módulos que ainda não migraram não participam da injeção de dependência
 * do Nest, mas alguns precisam criar contas — responsabilidade que já mudou
 * de lugar. Em vez de duplicar essa lógica neles, o main.ts registra aqui a
 * instância real assim que o Nest sobe, e eles consomem por esta função.
 *
 * Isto some junto com o último módulo Express.
 */
let instanciaServicoUsuarios: UsuariosService | null = null;

export function registrarServicoUsuarios(servico: UsuariosService): void {
  instanciaServicoUsuarios = servico;
}

export function obterServicoUsuarios(): UsuariosService {
  if (!instanciaServicoUsuarios) {
    throw new Error(
      "UsuariosService ainda não foi registrado — o Nest precisa subir antes de atender requisições.",
    );
  }
  return instanciaServicoUsuarios;
}
