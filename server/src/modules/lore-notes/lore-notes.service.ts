import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import type { UsuarioAutenticado } from "../../common/cls/usuario-autenticado.interface.js";
import { PersonagemModel } from "../personagem/models/personagem.model.js";
import { garantirAcessoAoPersonagem } from "../personagem/personagem-acesso.js";
import { LoreNoteModel } from "./models/lore-note.model.js";
import type { CriarLoreNoteDto, EditarLoreNoteDto } from "./lore-notes.dto.js";

export type LoreNoteApi = {
  id: number;
  title: string;
  subtitle: string | null;
  content: string;
  pdf_url: string | null;
  ordem: number;
  character_id: number | null;
  created_at: string | null;
  updated_at: string | null;
};

function formatarData(valor: unknown): string | null {
  return valor instanceof Date ? valor.toISOString() : null;
}

function textoOuNulo(valor: string | null | undefined): string | null {
  const texto = typeof valor === "string" ? valor.trim() : "";
  return texto === "" ? null : texto;
}

@Injectable()
export class LoreNotesService {
  constructor(
    @InjectModel(LoreNoteModel)
    private readonly modeloLoreNote: typeof LoreNoteModel,
    @InjectModel(PersonagemModel)
    private readonly modeloPersonagem: typeof PersonagemModel,
  ) {}

  /**
   * O que um jogador vê: as notas globais mais as endereçadas ao personagem
   * dele. Sem personagem informado, só as globais.
   *
   * A rota era aberta e aceitava qualquer characterId — dava para ler as notas
   * privadas de outro personagem só chutando o número. Agora exige login e
   * confere o dono.
   */
  async listarParaPersonagem(
    personagemId: number | undefined,
    usuario: UsuarioAutenticado,
  ): Promise<LoreNoteApi[]> {
    if (personagemId !== undefined) {
      const personagem = await this.modeloPersonagem.findByPk(personagemId);
      if (!personagem) {
        throw new NotFoundException("Personagem não encontrado.");
      }
      garantirAcessoAoPersonagem(personagem, usuario);
    }

    const encontradas = await this.modeloLoreNote.findAll({
      where:
        personagemId === undefined
          ? { characterId: null }
          : { [Op.or]: [{ characterId: null }, { characterId: personagemId }] },
      order: [
        ["ordem", "ASC"],
        ["createdAt", "ASC"],
      ],
    });

    return encontradas.map((nota) => this.mapear(nota));
  }

  /** O mestre vê tudo, com as globais primeiro. */
  async listarParaMestre(): Promise<LoreNoteApi[]> {
    const encontradas = await this.modeloLoreNote.findAll({
      order: [
        ["characterId", "ASC NULLS FIRST"],
        ["ordem", "ASC"],
        ["createdAt", "ASC"],
      ],
    });
    return encontradas.map((nota) => this.mapear(nota));
  }

  async criar(dados: CriarLoreNoteDto): Promise<LoreNoteApi> {
    if (dados.characterId != null) {
      await this.garantirPersonagemExistente(dados.characterId);
    }

    const criada = await this.modeloLoreNote.create({
      title: dados.title.trim(),
      subtitle: textoOuNulo(dados.subtitle),
      // content é NOT NULL com default '' — não gravar null.
      content: dados.content ?? "",
      pdfUrl: textoOuNulo(dados.pdfUrl),
      ordem: dados.ordem ?? 0,
      characterId: dados.characterId ?? null,
    });

    return this.mapear(criada);
  }

  async editar(id: number, dados: EditarLoreNoteDto): Promise<LoreNoteApi> {
    const nota = await this.modeloLoreNote.findByPk(id);
    if (!nota) {
      throw new NotFoundException("Nota de lore não encontrada.");
    }

    if (dados.characterId != null) {
      await this.garantirPersonagemExistente(dados.characterId);
    }

    if (dados.title !== undefined) nota.title = dados.title.trim();
    if (dados.subtitle !== undefined) nota.subtitle = textoOuNulo(dados.subtitle);
    if (dados.content !== undefined) nota.content = dados.content ?? "";
    if (dados.pdfUrl !== undefined) nota.pdfUrl = textoOuNulo(dados.pdfUrl);
    if (dados.ordem !== undefined) nota.ordem = dados.ordem;
    if (dados.characterId !== undefined) nota.characterId = dados.characterId;

    await nota.save();
    return this.mapear(nota);
  }

  async deletar(id: number): Promise<void> {
    const nota = await this.modeloLoreNote.findByPk(id);
    if (!nota) {
      throw new NotFoundException("Nota de lore não encontrada.");
    }
    await nota.destroy();
  }

  private async garantirPersonagemExistente(id: number): Promise<void> {
    const personagem = await this.modeloPersonagem.findByPk(id);
    if (!personagem) {
      throw new NotFoundException("Personagem não encontrado.");
    }
  }

  private mapear(nota: LoreNoteModel): LoreNoteApi {
    return {
      id: nota.id,
      title: nota.title,
      subtitle: nota.subtitle,
      content: nota.content,
      pdf_url: nota.pdfUrl,
      ordem: nota.ordem,
      character_id: nota.characterId,
      created_at: formatarData(nota.get("createdAt")),
      updated_at: formatarData(nota.get("updatedAt")),
    };
  }
}
