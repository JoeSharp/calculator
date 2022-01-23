import React, { MouseEventHandler } from 'react';
import './calculator.css';

enum Operation {
  add = '+',
  subtract = '-',
  divide = '÷',
  multiply = '*'
}

const executeOperation = (operation: Operation, a: number, b: number): number => {
  switch (operation) {
    case Operation.add: return a + b;
    case Operation.subtract: return a - b;
    case Operation.divide: return a * b;
    case Operation.multiply: return a / b;
  }
}

interface AbstractCalculatorAction {
  type: string;
}

interface AppendNumberAction extends AbstractCalculatorAction {
  type: 'appendNumber',
  digit: number
}

interface DeleteDigitAction extends AbstractCalculatorAction {
  type: 'deleteDigit'
}

interface AddDecimalPointAction extends AbstractCalculatorAction {
  type: 'addDecimalPoint'
}

interface ChooseOperation extends AbstractCalculatorAction {
  type: 'chooseOperation',
  operation: Operation
}

interface ComputeAction extends AbstractCalculatorAction {
  type: 'compute'
}

interface ClearAction extends AbstractCalculatorAction {
  type: 'clear'
}

type CalculatorAction = AppendNumberAction | DeleteDigitAction | AddDecimalPointAction | ChooseOperation | ComputeAction | ClearAction;

interface CalculatorState {
  currentOperand: string;
  previousOperand: string;
  operation: Operation | undefined
}

const DEFAULT_CALCULATOR_STATE: CalculatorState = {
  currentOperand: '',
  previousOperand: '',
  operation: undefined
}

const compute = (state: CalculatorState): CalculatorState => {
  const prev = parseFloat(state.previousOperand)
  const current = parseFloat(state.currentOperand)
  if (isNaN(prev) || isNaN(current)) return state;
  if (state.operation === undefined) return state;

  return {
    ...state,
    currentOperand: executeOperation(state.operation, prev, current).toString(10),
    operation: undefined,
    previousOperand: ''
  }
}

const calculatorReducer = (state: CalculatorState, action: CalculatorAction): CalculatorState => {
  switch (action.type) {
    case 'appendNumber':
      return {
        ...state,
        currentOperand: state.currentOperand + action.digit
      }
    case 'deleteDigit':
      return {
        ...state,
        currentOperand: state.currentOperand.toString().slice(0, -1)
      }
    case 'addDecimalPoint':
      return {
        ...state,
        currentOperand: state.currentOperand.includes('.') ? state.currentOperand : state.currentOperand + '.'
      }
    case 'chooseOperation': {
      let interimState = state;
      if (state.operation) {
        interimState = compute(state);
      }
      return {
        ...interimState,
        previousOperand: interimState.currentOperand,
        currentOperand: '',
        operation: action.operation
      }
    }
    case 'compute': {
      return compute(state);
    }
    case 'clear':
      return { ...DEFAULT_CALCULATOR_STATE }
  }
}

interface ButtonProps {
  onClick: MouseEventHandler,
  className?: string
  text: string
}

function App() {
  const [{ currentOperand, previousOperand, operation }, dispatch] = React.useReducer(calculatorReducer, DEFAULT_CALCULATOR_STATE);

  const createNumberButtonProps = React.useCallback((digit: number): ButtonProps => ({
    text: digit.toString(10),
    onClick: () => dispatch({ type: 'appendNumber', digit })
  }), [])
  const createOperationButtonProps = React.useCallback((operation: Operation): ButtonProps => ({
    text: operation,
    onClick: () => dispatch({ type: 'chooseOperation', operation })
  }), [])

  const buttons: ButtonProps[] = React.useMemo(() => {
    return [{
      text: 'AC',
      className: 'span-two',
      onClick: () => dispatch({ type: 'clear' })
    }, {
      text: 'DEL',
      onClick: () => dispatch({ type: 'deleteDigit' })
    },
    createOperationButtonProps(Operation.divide),
    createNumberButtonProps(1),
    createNumberButtonProps(2),
    createNumberButtonProps(3),
    createOperationButtonProps(Operation.multiply),
    createNumberButtonProps(5),
    createNumberButtonProps(4),
    createNumberButtonProps(6),
    createOperationButtonProps(Operation.add),
    createNumberButtonProps(7),
    createNumberButtonProps(8),
    createNumberButtonProps(9),
    createOperationButtonProps(Operation.subtract),
    {
      text: '.',
      onClick: () => dispatch({ type: 'addDecimalPoint' })
    },
    createNumberButtonProps(0), {
      text: '=',
      className: 'span-two',
      onClick: () => dispatch({ type: 'compute' })
    }]
  }, [createNumberButtonProps, createOperationButtonProps])

  return (
    <div className="calculator-grid">
      <div className="output">
        <div data-previous-operand className="previous-operand">{previousOperand} {operation}</div>
        <div data-current-operand className="current-operand">{currentOperand}</div>
      </div>
      {buttons.map(({ onClick, text, className }) =>
        <button className={className} onClick={onClick}>{text}</button>
      )}
    </div>
  );
}

export default App;
