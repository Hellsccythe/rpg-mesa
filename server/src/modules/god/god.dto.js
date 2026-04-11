var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsOptional, IsString } from "class-validator";
export class SalvarGodDto {
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], SalvarGodDto.prototype, "name", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SalvarGodDto.prototype, "description", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SalvarGodDto.prototype, "title", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SalvarGodDto.prototype, "indole", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SalvarGodDto.prototype, "dogma", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SalvarGodDto.prototype, "anatema", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SalvarGodDto.prototype, "weapons", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SalvarGodDto.prototype, "shortDescription", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SalvarGodDto.prototype, "imageUrl", void 0);
export class EditarGodDto {
}
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], EditarGodDto.prototype, "name", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], EditarGodDto.prototype, "description", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], EditarGodDto.prototype, "title", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], EditarGodDto.prototype, "indole", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], EditarGodDto.prototype, "dogma", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], EditarGodDto.prototype, "anatema", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], EditarGodDto.prototype, "weapons", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], EditarGodDto.prototype, "shortDescription", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], EditarGodDto.prototype, "imageUrl", void 0);
//# sourceMappingURL=god.dto.js.map