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
import { GeneroModule } from "./modules/genero/genero.module.js";
import { UsuariosModule } from "./modules/usuarios/usuarios.module.js";
import { PersonagensConsultaModule } from "./modules/personagem/personagens-consulta.module.js";
import { PersonagensOnboardingModule } from "./modules/personagem/personagens-onboarding.module.js";
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
import { LevelProgressionModule } from "./modules/level-progression/level-progression.module.js";

@Module({
  imports: [
    SequelizeConfigModule,
    AuthGuardsModule,
    ArmazenamentoArquivosModule,
    AuthModule,
    // Cada módulo migrado do Express/Supabase entra aqui. Os que ainda não
    // migraram continuam servidos pelos routers antigos, montados em main.ts.
    TabelasAcessoriasModule,
    PassadosModule,
    GodsModule,
    CityMapsModule,
    IndoleModule,
    GeneroModule,
    UsuariosModule,
    PersonagensConsultaModule,
    PersonagensOnboardingModule,
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
  ],
})
export class AppModule {}
