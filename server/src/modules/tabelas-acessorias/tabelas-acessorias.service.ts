import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { TabelaLookupBaseService } from "../../common/database/tabela-lookup-base.service.js";
import { UsoEquipamentoModel } from "./models/uso-equipamento.model.js";
import { CategoriaArmaModel } from "./models/categoria-arma.model.js";
import { CategoriaArmaduraModel } from "./models/categoria-armadura.model.js";
import { CategoriaVariadosModel } from "./models/categoria-variados.model.js";
import { PropriedadeArmaModel } from "./models/propriedade-arma.model.js";
import { ClasseArmaModel } from "./models/classe-arma.model.js";
import { PropriedadeArmaduraModel } from "./models/propriedade-armadura.model.js";
import { ClasseArmaduraModel } from "./models/classe-armadura.model.js";
import { PropriedadeVariadosModel } from "./models/propriedade-variados.model.js";
import { ClasseVariadosModel } from "./models/classe-variados.model.js";

/**
 * Cada tabela de lookup ganha sua própria instância do CRUD genérico,
 * parametrizada pelo model do Sequelize dela — mesma ideia da versão antiga
 * (funções genéricas recebendo o nome da tabela), só que agora tipada.
 */
@Injectable()
export class TabelasAcessoriasService {
  readonly tipos: TabelaLookupBaseService<UsoEquipamentoModel>;
  readonly categoriasArma: TabelaLookupBaseService<CategoriaArmaModel>;
  readonly categoriasArmadura: TabelaLookupBaseService<CategoriaArmaduraModel>;
  readonly categoriasVariados: TabelaLookupBaseService<CategoriaVariadosModel>;
  readonly propriedadesArma: TabelaLookupBaseService<PropriedadeArmaModel>;
  readonly classesArma: TabelaLookupBaseService<ClasseArmaModel>;
  readonly propriedadesArmadura: TabelaLookupBaseService<PropriedadeArmaduraModel>;
  readonly classesArmadura: TabelaLookupBaseService<ClasseArmaduraModel>;
  readonly propriedadesVariados: TabelaLookupBaseService<PropriedadeVariadosModel>;
  readonly classesVariados: TabelaLookupBaseService<ClasseVariadosModel>;

  constructor(
    @InjectModel(UsoEquipamentoModel) modeloTipo: typeof UsoEquipamentoModel,
    @InjectModel(CategoriaArmaModel) modeloCategoriaArma: typeof CategoriaArmaModel,
    @InjectModel(CategoriaArmaduraModel) modeloCategoriaArmadura: typeof CategoriaArmaduraModel,
    @InjectModel(CategoriaVariadosModel) modeloCategoriaVariados: typeof CategoriaVariadosModel,
    @InjectModel(PropriedadeArmaModel) modeloPropriedadeArma: typeof PropriedadeArmaModel,
    @InjectModel(ClasseArmaModel) modeloClasseArma: typeof ClasseArmaModel,
    @InjectModel(PropriedadeArmaduraModel) modeloPropriedadeArmadura: typeof PropriedadeArmaduraModel,
    @InjectModel(ClasseArmaduraModel) modeloClasseArmadura: typeof ClasseArmaduraModel,
    @InjectModel(PropriedadeVariadosModel) modeloPropriedadeVariados: typeof PropriedadeVariadosModel,
    @InjectModel(ClasseVariadosModel) modeloClasseVariados: typeof ClasseVariadosModel,
  ) {
    this.tipos = new TabelaLookupBaseService(modeloTipo);
    this.categoriasArma = new TabelaLookupBaseService(modeloCategoriaArma);
    this.categoriasArmadura = new TabelaLookupBaseService(modeloCategoriaArmadura);
    this.categoriasVariados = new TabelaLookupBaseService(modeloCategoriaVariados);
    this.propriedadesArma = new TabelaLookupBaseService(modeloPropriedadeArma);
    this.classesArma = new TabelaLookupBaseService(modeloClasseArma);
    this.propriedadesArmadura = new TabelaLookupBaseService(modeloPropriedadeArmadura);
    this.classesArmadura = new TabelaLookupBaseService(modeloClasseArmadura);
    this.propriedadesVariados = new TabelaLookupBaseService(modeloPropriedadeVariados);
    this.classesVariados = new TabelaLookupBaseService(modeloClasseVariados);
  }
}
