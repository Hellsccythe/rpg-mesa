import { Module } from "@nestjs/common";
import { SequelizeConfigModule } from "./config/database/sequelize/sequelize.config.js";
import { AuthGuardsModule } from "./common/auth/auth-guards.module.js";
import { ArmazenamentoArquivosModule } from "./common/storage/armazenamento-arquivos.module.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { TabelasAcessoriasModule } from "./modules/tabelas-acessorias/tabelas-acessorias.module.js";
import { PassadosModule } from "./modules/passados/passados.module.js";
import { GodsModule } from "./modules/god/god.module.js";
import { CityMapsModule } from "./modules/city_maps/city-maps.module.js";
import { IndoleModule } from "./modules/indole/indole.module.js";
import { RaridadeModule } from "./modules/raridade/raridade.module.js";
import { ConsumiveisModule } from "./modules/consumiveis/consumiveis.module.js";
import { ItensModule } from "./modules/itens/itens.module.js";
import { ReceitasModule } from "./modules/receitas/receitas.module.js";
import { GeneroModule } from "./modules/genero/genero.module.js";
import { UsuariosModule } from "./modules/usuarios/usuarios.module.js";
import { PersonagensConsultaModule } from "./modules/personagem/personagens-consulta.module.js";
import { PersonagensOnboardingModule } from "./modules/personagem/personagens-onboarding.module.js";
import { PersonagensCrudModule } from "./modules/personagem/personagens-crud.module.js";
import { PersonagensProgressaoModule } from "./modules/personagem/personagens-progressao.module.js";
import { PersonagensMestreModule } from "./modules/personagem/personagens-mestre.module.js";
import { PersonagensSolicitacoesModule } from "./modules/personagem/personagens-solicitacoes.module.js";
import { RacasModule } from "./modules/racas/raca.module.js";
import { ClassesModule } from "./modules/classes/classes.module.js";
import { ArmasModule } from "./modules/armas/arma.module.js";
import { SkillsModule } from "./modules/skill/skill.module.js";
import { TitulosModule } from "./modules/titulos/titulos.module.js";
import { PlayerTelasModule } from "./modules/player-telas/player-telas.module.js";
import { AdminModule } from "./modules/admin/admin.module.js";
import { LoreNotesModule } from "./modules/lore-notes/lore-notes.module.js";
import { NpcsModule } from "./modules/npcs/npcs.module.js";
import { CampanhasModule } from "./modules/campanhas/campanhas.module.js";
import { CharacterCreationModule } from "./modules/character-creation/character-creation.module.js";
import { LevelProgressionModule } from "./modules/level-progression/level-progression.module.js";

@Module({
  imports: [
    SequelizeConfigModule,
    AuthGuardsModule,
    ArmazenamentoArquivosModule,
    AuthModule,
    // Todos os módulos da aplicação. Não há mais router Express: o último
    // (/api/personagens) saiu junto com a migração do módulo de personagem.
    TabelasAcessoriasModule,
    PassadosModule,
    GodsModule,
    CityMapsModule,
    IndoleModule,
    RaridadeModule,
    ConsumiveisModule,
    ItensModule,
    ReceitasModule,
    GeneroModule,
    UsuariosModule,
    PersonagensConsultaModule,
    PersonagensOnboardingModule,
    PersonagensCrudModule,
    PersonagensProgressaoModule,
    PersonagensMestreModule,
    PersonagensSolicitacoesModule,
    LevelProgressionModule,
    RacasModule,
    ClassesModule,
    ArmasModule,
    SkillsModule,
    TitulosModule,
    PlayerTelasModule,
    AdminModule,
    LoreNotesModule,
    NpcsModule,
    CampanhasModule,
    CharacterCreationModule,
  ],
})
export class AppModule {}
