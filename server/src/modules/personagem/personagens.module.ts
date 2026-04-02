// server/src/modules/personagem/personagens.module.ts

// Exporta tudo sem extensão de arquivo (melhor prática com Yarn Berry + TypeScript)
export * from "./personagens.dto.js";
export * from "./personagens.service.js";
export * from "./personagens.controller.js";

// Export padrão para facilitar uso no frontend
export { personagensController as PersonagemController } from "./personagens.controller.js";
