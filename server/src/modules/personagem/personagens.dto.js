var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
// server/src/modules/personagem/personagens.dto.ts
import { IsString, IsOptional, IsNumber, IsEnum, IsObject, IsUrl, IsBoolean, Min, ValidateNested, } from "class-validator";
import { Type } from "class-transformer";
export var IndoleEnum;
(function (IndoleEnum) {
    IndoleEnum["BOM"] = "bom";
    IndoleEnum["NEUTRO_BOM"] = "neutro-bom";
    IndoleEnum["NEUTRO"] = "neutro";
    IndoleEnum["NEUTRO_RUIM"] = "neutro-ruim";
    IndoleEnum["RUIM"] = "ruim";
})(IndoleEnum || (IndoleEnum = {}));
// DTO interno para o campo "data" do personagem
class PersonagemDataDto {
}
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], PersonagemDataDto.prototype, "appearance", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], PersonagemDataDto.prototype, "history", void 0);
__decorate([
    IsOptional(),
    IsEnum(IndoleEnum),
    __metadata("design:type", String)
], PersonagemDataDto.prototype, "indole", void 0);
__decorate([
    IsOptional(),
    IsUrl(),
    __metadata("design:type", String)
], PersonagemDataDto.prototype, "avatar_url", void 0);
// ==================== DTO PARA CRIAR PERSONAGEM ====================
export class SalvarPersonagemDto {
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], SalvarPersonagemDto.prototype, "name", void 0);
__decorate([
    IsOptional(),
    IsNumber(),
    Min(1),
    __metadata("design:type", Number)
], SalvarPersonagemDto.prototype, "level", void 0);
__decorate([
    IsOptional(),
    IsObject(),
    ValidateNested(),
    Type(() => PersonagemDataDto),
    __metadata("design:type", PersonagemDataDto)
], SalvarPersonagemDto.prototype, "data", void 0);
__decorate([
    IsOptional(),
    IsUrl(),
    __metadata("design:type", String)
], SalvarPersonagemDto.prototype, "avatarUrl", void 0);
// ==================== DTO PARA EDITAR PERSONAGEM ====================
export class EditarPersonagemDto {
}
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], EditarPersonagemDto.prototype, "name", void 0);
__decorate([
    IsOptional(),
    IsNumber(),
    Min(1),
    __metadata("design:type", Number)
], EditarPersonagemDto.prototype, "level", void 0);
__decorate([
    IsOptional(),
    IsObject(),
    ValidateNested(),
    Type(() => PersonagemDataDto),
    __metadata("design:type", PersonagemDataDto)
], EditarPersonagemDto.prototype, "data", void 0);
export class SolicitarAlteracaoPersonagemDto {
}
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SolicitarAlteracaoPersonagemDto.prototype, "name", void 0);
__decorate([
    IsOptional(),
    IsUrl(),
    __metadata("design:type", String)
], SolicitarAlteracaoPersonagemDto.prototype, "avatarUrl", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SolicitarAlteracaoPersonagemDto.prototype, "history", void 0);
__decorate([
    IsOptional(),
    IsUrl(),
    __metadata("design:type", String)
], SolicitarAlteracaoPersonagemDto.prototype, "historyDocumentPath", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SolicitarAlteracaoPersonagemDto.prototype, "historyDocumentName", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SolicitarAlteracaoPersonagemDto.prototype, "historyDocumentMimeType", void 0);
export class RevisarSolicitacaoDto {
}
__decorate([
    IsBoolean(),
    __metadata("design:type", Boolean)
], RevisarSolicitacaoDto.prototype, "approve", void 0);
export class SalvarDeusDto {
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], SalvarDeusDto.prototype, "name", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SalvarDeusDto.prototype, "description", void 0);
export class SalvarCidadeMapaDto {
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], SalvarCidadeMapaDto.prototype, "name", void 0);
__decorate([
    IsString(),
    __metadata("design:type", String)
], SalvarCidadeMapaDto.prototype, "mapReference", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SalvarCidadeMapaDto.prototype, "description", void 0);
export class SalvarClasseMestreDto {
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], SalvarClasseMestreDto.prototype, "name", void 0);
__decorate([
    IsString(),
    __metadata("design:type", String)
], SalvarClasseMestreDto.prototype, "tier", void 0);
__decorate([
    IsString(),
    __metadata("design:type", String)
], SalvarClasseMestreDto.prototype, "description", void 0);
__decorate([
    IsOptional(),
    IsNumber(),
    Min(1),
    __metadata("design:type", Number)
], SalvarClasseMestreDto.prototype, "maxLevel", void 0);
export class SalvarTituloMestreDto {
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], SalvarTituloMestreDto.prototype, "name", void 0);
__decorate([
    IsString(),
    __metadata("design:type", String)
], SalvarTituloMestreDto.prototype, "tier", void 0);
__decorate([
    IsString(),
    __metadata("design:type", String)
], SalvarTituloMestreDto.prototype, "description", void 0);
export class AdicionarSkillPersonagemDto {
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], AdicionarSkillPersonagemDto.prototype, "skillName", void 0);
export class AdicionarTituloPersonagemDto {
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], AdicionarTituloPersonagemDto.prototype, "titleName", void 0);
export class AdicionarNotaAventuraDto {
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], AdicionarNotaAventuraDto.prototype, "note", void 0);
// ==================== DTO PARA LISTAR / FILTRAR ====================
export class ListarPersonagemDto {
}
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], ListarPersonagemDto.prototype, "nome", void 0);
__decorate([
    IsOptional(),
    IsNumber(),
    Min(1),
    __metadata("design:type", Number)
], ListarPersonagemDto.prototype, "minLevel", void 0);
__decorate([
    IsOptional(),
    IsNumber(),
    Min(1),
    __metadata("design:type", Number)
], ListarPersonagemDto.prototype, "maxLevel", void 0);
__decorate([
    IsOptional(),
    __metadata("design:type", String)
], ListarPersonagemDto.prototype, "campaignId", void 0);
//# sourceMappingURL=personagens.dto.js.map