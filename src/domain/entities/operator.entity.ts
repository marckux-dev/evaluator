// src/domain/entities/operator.entity.ts
import {TokenEntity} from "./token.entity";
import {ExpressionEntity} from "./expression.entity";
import {ConstantEntity} from "./constant.entity";

export  class OperatorEntity extends TokenEntity {
  public readonly symbol: string;
  public readonly numberOfOperands: number;
  public readonly operation: (operands: number[]) => number;

  constructor(numberOfOperands: number, operation: (operands: number[]) => number, symbol: string) {
    super();
    this.numberOfOperands = numberOfOperands;
    this.operation = operation;
    this.symbol = symbol;
  }


  public apply (expression: ExpressionEntity) : ExpressionEntity {
    if (expression.getTokens().length < this.numberOfOperands) {
      throw new Error("Not enough operands");
    }
    // create a deep copy of the expression
    let newExpression = expression.copy();
    const operands = [];
    let i = this.numberOfOperands;
    while (i > 0 && newExpression.length() > 0) {
      const token = newExpression.popToken();
      if (token instanceof ConstantEntity) {
        operands.push(token.value);
        i--;
      } else {
        newExpression = (token as OperatorEntity).apply(newExpression);
      }
    }
    if (i > 0) {
      throw new Error("Not enough operands");
    } else {
      const result = this.operation(operands);
      const newConstant = new ConstantEntity(result);
      newExpression.pushToken(newConstant);
    }
    return newExpression;
  }

  public toString() : string {
    return this.symbol;
  }
}