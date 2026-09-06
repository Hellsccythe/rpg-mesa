import { SequelizeModule } from "@nestjs/sequelize";
import {
  preencherCriadoPorEAtualizadoPor,
  preencherAtualizadoPor,
  preencherDeletadoPor,
} from "../../../common/database/auditoria.hooks.js";

/**
 * Conexão única do Sequelize com o Postgres. As migrations em
 * database/migrations/ continuam sendo a fonte da verdade do schema —
 * o Sequelize aqui só descreve/mapeia o que já existe, nunca sincroniza
 * ou altera a estrutura do banco sozinho (synchronize sempre false).
 *
 * Os hooks abaixo são globais: valem para TODO model registrado nesta
 * conexão, preenchendo a auditoria (created_by/updated_by/deleted_by)
 * automaticamente a partir do usuário autenticado da requisição atual.
 */
export const SequelizeConfigModule = SequelizeModule.forRootAsync({
  useFactory: () => ({
    dialect: "postgres",
    uri: process.env.DATABASE_URL,
    autoLoadModels: true,
    synchronize: false,
    logging: false,
    define: {
      underscored: true,
      timestamps: true,
    },
    hooks: {
      beforeCreate: preencherCriadoPorEAtualizadoPor,
      beforeUpdate: preencherAtualizadoPor,
      beforeDestroy: preencherDeletadoPor,
    },
  }),
});
