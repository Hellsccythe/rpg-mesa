// server/src/modules/personagem/personagens.controller.ts
import { personagensService } from "./personagens.service.js";
const layoutPadrao = {
    titulo: "Caminho Sem Volta",
    subtitulo: "Escolha seu destino ou crie um novo herói",
    backgroundImage: "/login-bg.jpg",
};
export const personagensController = {
    /**
     * Retorna a configuração de layout + lista pública de personagens.
     * Não requer autenticação — qualquer visitante pode carregar a página.
     */
    async paginaInicial() {
        const personagens = await personagensService.listarTodosPublico();
        return { layout: layoutPadrao, personagens };
    },
    /**
     * Lista personagens do usuário logado (para tabelas com filtros/reload).
     */
    async listarMeus(filtro = {}, accessToken) {
        return personagensService.listarMeusPersonagens(filtro, accessToken);
    },
    /**
     * Retorna um personagem específico do usuário logado.
     */
    async obterMeu(characterId, accessToken) {
        if (!characterId)
            throw new Error("ID do personagem é obrigatório");
        return personagensService.obterMeuPersonagemPorId(characterId, accessToken);
    },
    async obterComoMestre(characterId, accessToken) {
        if (!characterId)
            throw new Error("ID do personagem é obrigatório");
        return personagensService.obterPersonagemPorIdComoMestre(characterId, accessToken);
    },
    /**
     * Salva um novo personagem.
     */
    async salvar(dto, accessToken) {
        if (!dto.name?.trim())
            throw new Error("Nome do personagem é obrigatório");
        return personagensService.salvarPersonagem(dto, accessToken);
    },
    /**
     * Edita um personagem existente.
     */
    async editar(characterId, dto, accessToken) {
        if (!characterId)
            throw new Error("ID do personagem é obrigatório");
        return personagensService.editarPersonagem(characterId, dto, accessToken);
    },
    async solicitarAlteracao(characterId, dto, accessToken) {
        if (!characterId)
            throw new Error("ID do personagem é obrigatório");
        return personagensService.solicitarAlteracao(characterId, dto, accessToken);
    },
    async listarSolicitacoesPendentes(accessToken) {
        return personagensService.listarSolicitacoesPendentes(accessToken);
    },
    async listarEmailsPermitidosCriacaoPersonagem(accessToken) {
        return personagensService.listarEmailsPermitidosCriacaoPersonagem(accessToken);
    },
    async adicionarEmailPermitidoCriacaoPersonagem(email, accessToken) {
        if (!email?.trim())
            throw new Error("Email e obrigatorio para liberacao");
        return personagensService.adicionarEmailPermitidoCriacaoPersonagem(email, accessToken);
    },
    async removerEmailPermitidoCriacaoPersonagem(email, accessToken) {
        if (!email?.trim())
            throw new Error("Email e obrigatorio para remocao");
        return personagensService.removerEmailPermitidoCriacaoPersonagem(email, accessToken);
    },
    async revisarSolicitacao(characterId, dto, accessToken) {
        if (!characterId)
            throw new Error("ID do personagem é obrigatório");
        return personagensService.revisarSolicitacao(characterId, dto, accessToken);
    },
    async salvarDeus(dto, accessToken) {
        if (!dto.name?.trim())
            throw new Error("Nome do deus é obrigatório");
        return personagensService.salvarDeus(dto, accessToken);
    },
    async salvarCidadeMapa(dto, accessToken) {
        if (!dto.name?.trim())
            throw new Error("Nome da cidade é obrigatório");
        if (!dto.mapReference?.trim())
            throw new Error("Referência do mapa é obrigatória");
        return personagensService.salvarCidadeMapa(dto, accessToken);
    },
    async salvarClasseMestre(dto, accessToken) {
        if (!dto.name?.trim())
            throw new Error("Nome da classe é obrigatório");
        if (!dto.tier?.trim())
            throw new Error("Tier da classe é obrigatório");
        if (!dto.description?.trim())
            throw new Error("Descrição da classe é obrigatória");
        return personagensService.salvarClasseMestre(dto, accessToken);
    },
    async salvarTituloMestre(dto, accessToken) {
        if (!dto.name?.trim())
            throw new Error("Nome do título é obrigatório");
        if (!dto.tier?.trim())
            throw new Error("Tier do título é obrigatório");
        if (!dto.description?.trim())
            throw new Error("Descrição do título é obrigatória");
        return personagensService.salvarTituloMestre(dto, accessToken);
    },
    async adicionarSkillEmPersonagem(characterId, dto, accessToken) {
        if (!characterId)
            throw new Error("ID do personagem é obrigatório");
        if (!dto.skillName?.trim())
            throw new Error("Nome da skill é obrigatório");
        return personagensService.adicionarSkillEmPersonagem(characterId, dto, accessToken);
    },
    async adicionarTituloEmPersonagem(characterId, dto, accessToken) {
        if (!characterId)
            throw new Error("ID do personagem é obrigatório");
        if (!dto.titleName?.trim())
            throw new Error("Nome do título é obrigatório");
        return personagensService.adicionarTituloEmPersonagem(characterId, dto, accessToken);
    },
    async adicionarNotaAventura(characterId, dto, accessToken) {
        if (!characterId)
            throw new Error("ID do personagem é obrigatório");
        if (!dto.note?.trim())
            throw new Error("Nota de aventura é obrigatória");
        return personagensService.adicionarNotaAventura(characterId, dto, accessToken);
    },
    /**
     * Soft delete de personagem do usuário logado.
     */
    async deletar(characterId, accessToken) {
        if (!characterId)
            throw new Error("ID do personagem é obrigatório");
        return personagensService.deletarMeuPersonagem(characterId, accessToken);
    },
};
//# sourceMappingURL=personagens.controller.js.map