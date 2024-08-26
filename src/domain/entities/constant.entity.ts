// src/entity/domain/entities/constant.entity.ts
import {TokenEntity} from "./token.entity";

export  class ConstantEntity extends TokenEntity {
  public readonly value: number;

  constructor(value: number) {
    super();
    this.value = value;
  }

  public toString(): string {
    return this.value.toString();
  }
}
