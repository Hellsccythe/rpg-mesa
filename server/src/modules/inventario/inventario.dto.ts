import { IsBoolean, IsIn, IsInt, IsOptional, Max, Min } from "class-validator";
import { QUALIDADES, TABELAS_DE_INVENTARIO, type Qualidade, type TabelaDeInventario } from "./inventario.model.js";

export class AdicionarAoInventarioDto {
  @IsIn(TABELAS_DE_INVENTARIO)
  tabela!: TabelaDeInventario;

  @IsInt() @Min(1)
  id!: number;

  @IsOptional() @IsInt() @Min(1) @Max(999)
  quantidade?: number;

  /**
   * Só o mestre deveria dar item com qualidade (um saque de obra-prima). O
   * jogador que adiciona à mão está registrando compra, e compra é null.
   * A rota é a mesma; a distinção é feita no serviço pelo tipo do usuário.
   */
  @IsOptional() @IsIn([...QUALIDADES, null])
  qualidade?: Qualidade | null;

  @IsOptional() @IsBoolean()
  rapido?: boolean;

  @IsOptional() @IsBoolean()
  equipado?: boolean;
}

export class RemoverDoInventarioDto {
  @IsOptional() @IsInt() @Min(1) @Max(999)
  quantidade?: number;
}

export class AlternarNoInventarioDto {
  @IsIn(["rapido", "equipado"])
  campo!: "rapido" | "equipado";

  @IsBoolean()
  valor!: boolean;
}
