import { Column, DataType, Model, Table } from "sequelize-typescript";
import type { PointOfInterestDto } from "../city-maps.dto.js";

/**
 * O JSONB "data" é mantido de propósito: guarda pointsOfInterest, um array
 * de objetos com coordenadas e links entre mapas. É dado genuinamente
 * aninhado — diferente do caso de gods, onde o JSONB só duplicava colunas
 * que já existiam (ver migration 063).
 */
export type DadosCityMap = {
  imageUrl?: string;
  pointsOfInterest?: PointOfInterestDto[];
  citySlug?: string;
  cityName?: string;
  cityDescription?: string;
  cityCulture?: string;
  mapType?: "city" | "localized";
  parentCityMapId?: string;
};

@Table({ tableName: "city_maps", timestamps: true, paranoid: true })
export class CityMapModel extends Model {
  /** O mundo do mapa (migration 101). O nome é único por mundo, entre os vivos. */
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare campaignId: number;

  @Column(DataType.TEXT)
  declare name: string;

  @Column(DataType.TEXT)
  declare mapReference: string;

  @Column({ type: DataType.TEXT, defaultValue: "" })
  declare description: string;

  @Column({ type: DataType.JSONB, defaultValue: {} })
  declare data: DadosCityMap;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}
