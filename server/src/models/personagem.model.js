var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Table, Column, getTableName, getSelectFields, mapFromRow, } from "../common/decorators/index.js";
// ==================== MODEL (declaração da tabela) ====================
let PersonagemModel = class PersonagemModel {
};
__decorate([
    Column({ name: "id" }),
    __metadata("design:type", String)
], PersonagemModel.prototype, "characterId", void 0);
__decorate([
    Column({ name: "user_id" }),
    __metadata("design:type", String)
], PersonagemModel.prototype, "userId", void 0);
__decorate([
    Column({ name: "campaign_id", nullable: true }),
    __metadata("design:type", String)
], PersonagemModel.prototype, "campaignId", void 0);
__decorate([
    Column({ name: "name" }),
    __metadata("design:type", String)
], PersonagemModel.prototype, "name", void 0);
__decorate([
    Column({ name: "level" }),
    __metadata("design:type", Number)
], PersonagemModel.prototype, "level", void 0);
__decorate([
    Column({ name: "data" }),
    __metadata("design:type", Object)
], PersonagemModel.prototype, "data", void 0);
__decorate([
    Column({ name: "avatar_url", nullable: true }),
    __metadata("design:type", String)
], PersonagemModel.prototype, "avatarUrl", void 0);
__decorate([
    Column({ name: "created_at" }),
    __metadata("design:type", String)
], PersonagemModel.prototype, "createdAt", void 0);
__decorate([
    Column({ name: "updated_at" }),
    __metadata("design:type", String)
], PersonagemModel.prototype, "updatedAt", void 0);
PersonagemModel = __decorate([
    Table("characters")
], PersonagemModel);
// ==================== EXPORTS GERADOS PELOS DECORATORS ====================
export const PERSONAGEM_TABLE = getTableName(PersonagemModel);
export const PERSONAGEM_SELECT_FIELDS = getSelectFields(PersonagemModel);
export function mapPersonagem(row) {
    return mapFromRow(PersonagemModel, row);
}
//# sourceMappingURL=personagem.model.js.map