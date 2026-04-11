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
export class SalvarCityMapDto {
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], SalvarCityMapDto.prototype, "name", void 0);
__decorate([
    IsString(),
    __metadata("design:type", String)
], SalvarCityMapDto.prototype, "mapReference", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SalvarCityMapDto.prototype, "description", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SalvarCityMapDto.prototype, "imageUrl", void 0);
__decorate([
    IsOptional(),
    __metadata("design:type", Array)
], SalvarCityMapDto.prototype, "pointsOfInterest", void 0);
export class EditarCityMapDto {
}
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], EditarCityMapDto.prototype, "name", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], EditarCityMapDto.prototype, "mapReference", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], EditarCityMapDto.prototype, "description", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], EditarCityMapDto.prototype, "imageUrl", void 0);
__decorate([
    IsOptional(),
    __metadata("design:type", Array)
], EditarCityMapDto.prototype, "pointsOfInterest", void 0);
//# sourceMappingURL=city-maps.dto.js.map