// src/domain/entities/operators/addition.operator.ts
import {OperatorEntity} from "../operator.entity";

const addition = (operands: number[]) => operands[1] + operands[0];

export class AdditionOperator extends OperatorEntity {
  constructor() {
    super(2, addition, '+');
  }
}