// src/domain/entities/expression.entity.ts
import {TokenEntity} from "./token.entity";
import {ConstantEntity} from "./constant.entity";
import {OperatorEntity} from "./operator.entity";


export class ExpressionEntity {
  private stack: TokenEntity[];

  constructor(tokens: TokenEntity[]) {
    this.stack = tokens;
  }

  public getTokens() : TokenEntity[] {
    return this.stack;
  }

  public setTokens(tokens: TokenEntity[]) {
    this.stack = tokens;
  }

  public popToken() : TokenEntity | undefined{
    if (this.stack.length === 0) {
      throw new Error("No more tokens");
    }
    return this.stack.pop();
  }

  public pushToken(token: TokenEntity) {
    this.stack.push(token);
  }

  public length() : number {
    return this.stack.length;
  }

  public copy() : ExpressionEntity {
    return new ExpressionEntity(this.stack.slice());
  }

  public evaluate() : number {
    const token = this.popToken();
    if (token instanceof ConstantEntity) {
      if (this.length() > 0) {
        throw new Error("Extra tokens");
      } else {
        return token.value;
      }
    } else {
      const operator = token as OperatorEntity;
      const newExpression = operator.apply(this);
      return newExpression.evaluate();
    }
  }

  public toString() : string {
    return this.stack.map(token => token.toString()).join(" ");
  }


}