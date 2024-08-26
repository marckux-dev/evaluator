// src/domain/entities/operators/division.operator.ts

import {OperatorEntity} from "../operator.entity";

const division = (operands: number[]) => operands[1] / operands[0];

export class DivisionOperator extends OperatorEntity {
  constructor() {
    super(2, division, '/');
  }
}