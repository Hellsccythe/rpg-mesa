import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "./jwt-auth.guard.js";
import { MasterGuard } from "./master.guard.js";

/**
 * Configura o JwtService (usado tanto pra assinar o token no login quanto
 * pra validar nas rotas protegidas) e disponibiliza os Guards globalmente,
 * pra qualquer módulo poder usar @UseGuards(JwtAuthGuard, MasterGuard) sem
 * precisar importar nada extra.
 */
@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: Number(process.env.JWT_EXPIRES_IN_SEGUNDOS ?? 86400) },
    }),
  ],
  providers: [JwtAuthGuard, MasterGuard],
  exports: [JwtModule, JwtAuthGuard, MasterGuard],
})
export class AuthGuardsModule {}
