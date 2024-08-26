// src/domain/entities/operators/multiplication.operator.ts

import {OperatorEntity} from "../operator.entity";

const multiplication = (operands: number[]) => operands[1] * operands[0];

export class MultiplicationOperator extends OperatorEntity {
  constructor() {
    super(2, multiplication, '*');
  }
}