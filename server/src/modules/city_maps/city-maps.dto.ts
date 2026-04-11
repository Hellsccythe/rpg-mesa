import { IsOptional, IsString } from "class-validator";

export type PointOfInterestDto = {
  id?: string;
  name: string;
  x: number;
  y: number;
  description?: string;
  targetCityMapId?: string;
  targetLabel?: string;
};

export class SalvarCityMapDto {
  @IsString()
  name: string;

  @IsString()
  mapReference: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  pointsOfInterest?: PointOfInterestDto[];

  @IsOptional()
  @IsString()
  citySlug?: string;

  @IsOptional()
  @IsString()
  cityName?: string;

  @IsOptional()
  @IsString()
  cityDescription?: string;

  @IsOptional()
  @IsString()
  cityCulture?: string;

  @IsOptional()
  @IsString()
  mapType?: "city" | "localized";

  @IsOptional()
  @IsString()
  parentCityMapId?: string;
}

export class EditarCityMapDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  mapReference?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  pointsOfInterest?: PointOfInterestDto[];

  @IsOptional()
  @IsString()
  citySlug?: string;

  @IsOptional()
  @IsString()
  cityName?: string;

  @IsOptional()
  @IsString()
  cityDescription?: string;

  @IsOptional()
  @IsString()
  cityCulture?: string;

  @IsOptional()
  @IsString()
  mapType?: "city" | "localized";

  @IsOptional()
  @IsString()
  parentCityMapId?: string;
}
