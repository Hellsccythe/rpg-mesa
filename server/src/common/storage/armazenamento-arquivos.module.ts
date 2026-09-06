import { Global, Module } from "@nestjs/common";
import { ArmazenamentoArquivosService } from "./armazenamento-arquivos.service.js";

/**
 * Global porque praticamente todo módulo com imagem vai precisar dele
 * (passados, deuses, mapas, raças, avatares de personagem...).
 */
@Global()
@Module({
  providers: [ArmazenamentoArquivosService],
  exports: [ArmazenamentoArquivosService],
})
export class ArmazenamentoArquivosModule {}
