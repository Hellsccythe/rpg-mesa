import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import type { Request } from "express";
import type { Observable } from "rxjs";
import { definirCampanhaNoContexto } from "../../common/cls/contexto-requisicao.js";
import { CampanhaModel } from "./models/campanha.model.js";

/** O header que o cliente manda com o mundo em que está: o slug ou o id. */
export const HEADER_DA_CAMPANHA = "x-campanha";

/** Quanto tempo uma resolução slug → campanha vale antes de ir ao banco de novo. */
const VALIDADE_DO_CACHE_MS = 30_000;

type CampanhaResolvida = { id: number; ativa: boolean; validoAte: number };

/**
 * Lê o header X-Campanha e publica o mundo no contexto da requisição.
 *
 * É um interceptor global, e não um middleware, de propósito: interceptors
 * rodam DEPOIS dos guards, então aqui já se sabe se quem chama é mestre —
 * o mestre pode apontar para qualquer mundo, inclusive inativo (está
 * preparando); jogador e anônimo só para mundo ativo.
 *
 * Header inválido é ignorado, não é erro: um slug velho guardado no
 * navegador não pode derrubar toda requisição. Sem campanha no contexto,
 * CampanhasService.resolverCampanhaAtiva cai na única ativa ou responde
 * 400 com a explicação — nunca "todos os mundos".
 */
@Injectable()
export class CampanhaAtivaInterceptor implements NestInterceptor {
  private readonly cache = new Map<string, CampanhaResolvida>();

  constructor(
    @InjectModel(CampanhaModel)
    private readonly modeloCampanha: typeof CampanhaModel,
  ) {}

  async intercept(contextoExecucao: ExecutionContext, proximo: CallHandler): Promise<Observable<unknown>> {
    const requisicao = contextoExecucao.switchToHttp().getRequest<Request>();
    const valor = requisicao.headers[HEADER_DA_CAMPANHA];
    const chave = (Array.isArray(valor) ? valor[0] : valor)?.trim().toLowerCase();

    if (chave) {
      const campanha = await this.resolver(chave);
      const ehMestre = requisicao.usuarioAutenticado?.tipo === "gm";
      if (campanha && (campanha.ativa || ehMestre)) {
        definirCampanhaNoContexto(campanha.id);
      }
    }

    return proximo.handle();
  }

  private async resolver(chave: string): Promise<CampanhaResolvida | null> {
    const agora = Date.now();
    const guardada = this.cache.get(chave);
    if (guardada && guardada.validoAte > agora) return guardada;

    const porId = /^\d+$/.test(chave);
    const campanha = await this.modeloCampanha.findOne({
      where: porId ? { id: Number(chave) } : { slug: chave },
      attributes: ["id", "isActive"],
    });
    if (!campanha) return null;

    const resolvida = { id: campanha.id, ativa: campanha.isActive, validoAte: agora + VALIDADE_DO_CACHE_MS };
    this.cache.set(chave, resolvida);
    return resolvida;
  }
}
