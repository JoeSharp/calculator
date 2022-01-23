import React from 'react';
import './calculator.css';

/**
 * These are the supported operations in our calculator
 */
enum Operation {
  add = '+',
  subtract = '-',
  divide = '÷',
  multiply = '*'
}

/**
 * A function that executes a two operand operation
 * @param operation The operation to execute
 * @param a First operand
 * @param b Second operand
 * @returns The result of the operation
 */
const executeOperation = (operation: Operation, a: number, b: number): number => {
  switch (operation) {
    case Operation.add: return a + b;
    case Operation.subtract: return a - b;
    case Operation.divide: return a / b;
    case Operation.multiply: return a * b;
  }
}

/**
 * A generalised form of the actions that can be sent to our reducer
 */
interface AbstractCalculatorAction {
  type: string;
}

/**
 * When the user clicks on one of the number buttons
 */
interface AppendNumberAction extends AbstractCalculatorAction {
  type: 'appendNumber',
  digit: number
}

/**
 * The user has clicked on the delete button
 */
interface DeleteDigitAction extends AbstractCalculatorAction {
  type: 'deleteDigit'
}

/**
 * User clicks on the decimal point button
 */
interface AddDecimalPointAction extends AbstractCalculatorAction {
  type: 'addDecimalPoint'
}

/**
 * User clicks on one of the operator buttons
 */
interface ChooseOperation extends AbstractCalculatorAction {
  type: 'chooseOperation',
  operation: Operation
}

/**
 * User clicks on equals
 */
interface ComputeAction extends AbstractCalculatorAction {
  type: 'compute'
}

/**
 * User clicks on the clear button (AC)
 */
interface ClearAction extends AbstractCalculatorAction {
  type: 'clear'
}

type CalculatorAction = AppendNumberAction | DeleteDigitAction | AddDecimalPointAction | ChooseOperation | ComputeAction | ClearAction;

/**
 * The state of the calculator
 */
interface CalculatorState {
  currentOperand: string;
  previousOperand: string;
  operation: Operation | undefined
}

/**
 * The clear down state of the calculator
 */
const DEFAULT_CALCULATOR_STATE: CalculatorState = {
  currentOperand: '',
  previousOperand: '',
  operation: undefined
}

/**
 * Executes the current operation.
 * 
 * @param state The current calculator state
 * @returns The new calculator state
 */
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

/**
 * This reducer executes the various actions of the calculator.
 * 
 * @param state The current state of the calculator
 * @param action When the user clicks on a button, it will generally trigger an action
 * @returns The new state
 */
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

function App() {
  const [{ currentOperand, previousOperand, operation }, dispatch] = React.useReducer(calculatorReducer, DEFAULT_CALCULATOR_STATE);

  // Buttons that add digits have a common shape
  const createNumberButtonProps = React.useCallback((digit: number): React.HTMLProps<HTMLButtonElement> => ({
    value: digit.toString(10),
    onClick: () => dispatch({ type: 'appendNumber', digit })
  }), []);

  // Buttons that trigger operations have a common shape
  const createOperationButtonProps = React.useCallback((operation: Operation): React.HTMLProps<HTMLButtonElement> => ({
    value: operation,
    onClick: () => dispatch({ type: 'chooseOperation', operation })
  }), [])

  /**
   * Create an array of button properties that we can then iterate through
   */
  const buttons: React.HTMLProps<HTMLButtonElement>[] = React.useMemo(() => {
    return [{
      value: 'AC',
      className: 'span-two',
      onClick: () => dispatch({ type: 'clear' })
    }, {
      value: 'DEL',
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
      value: '.',
      onClick: () => dispatch({ type: 'addDecimalPoint' })
    },
    createNumberButtonProps(0), {
      value: '=',
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
      {buttons.map(({ onClick, value, className }) =>
        <button className={className} onClick={onClick}>{value}</button>
      )}
    </div>
  );
}

export default App;
