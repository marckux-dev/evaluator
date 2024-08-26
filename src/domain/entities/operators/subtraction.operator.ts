// src/domain/entities/operators/subtraction.operator.ts

import {OperatorEntity} from "../operator.entity";

const subtraction = (operands: number[]) => operands[1] - operands[0];

export class SubtractionOperator extends OperatorEntity {
  constructor() {
    super(2, subtraction, '-');
  }
}
