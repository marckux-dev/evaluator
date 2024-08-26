import {ExpressionEntity} from "./domain/entities/expression.entity";
import {ConstantEntity} from "./domain/entities/constant.entity";
import {AdditionOperator} from "./domain/entities/operators/addition.operator";
import {MultiplicationOperator} from "./domain/entities/operators/multiplication.operator";
import {SubtractionOperator} from "./domain/entities/operators/subtraction.operator";
import {DivisionOperator} from "./domain/entities/operators/division.operator";

const expression = new ExpressionEntity(
  [
    new ConstantEntity(2),
    new ConstantEntity(5),
    new DivisionOperator()
  ]
);
const result = expression.evaluate();
console.log(`Resultado: ${result}`); // Resultado: 3

