const refs = {
  calculatorForm: document.getElementById('calculator_form'),
  inputField: document.getElementById('input_field'),
  inputFieldExtra: document.getElementById('extra_input_field'),
  numbers: document.querySelectorAll('[data-type="number"]'),
  utils: document.querySelectorAll('[data-type="util"]'),
  operators: document.querySelectorAll('[data-type="operator"]'),
  managers: document.querySelectorAll('[data-type="manager"]'),
};

refs.calculatorForm.addEventListener('click', onButtonsClick);
refs.calculatorForm.addEventListener('keydown', onKeydown);
refs.calculatorForm.addEventListener('input', onInputChange);

let EXPRESSION_FOR_CALCULATION = '';
let IS_CALCULATED = false;
let numberSymbolCount = 0;

function onButtonsClick(e) {
  const buttonTypes = ['button', 'submit', 'reset'];
  const isButtonType = buttonTypes.includes(e.target.type);

  if (!isButtonType) {
    return;
  }

  switch (e.target.dataset.type) {
    case 'number':
      if (IS_CALCULATED) {
        clearInputField();
        clearInputFieldExtra();
        IS_CALCULATED = false;
      }
      input(e.target.value);
      break;

    case 'util':
      if (refs.inputField.value === '') return;
      onUtilBtnClick(e);
      break;

    case 'operator':
      if (refs.inputField.value === '') return;
      IS_CALCULATED = false;
      input(e.target.value);
      onOperatorClick(e);
      break;

    case 'reset':
      clearInputFieldExtra();
      break;

    case 'submit':
      onCalculateBtnClick(e);
      break;

    default:
      break;
  }

  function input(value) {
    refs.inputField.value += value;
  }
}

function showResult(result) {
  const isFloat = result.toString().includes('.');
  const normalizedResult = removeLastZero(result.toFixed(8).toString());

  refs.inputFieldExtra.innerText = refs.inputField.value + '=';
  refs.inputField.value = isFloat ? normalizedResult : result;
}

function clearInputField() {
  refs.inputField.value = '';
}

function clearInputFieldExtra() {
  refs.inputFieldExtra.innerText = '';
}

function onKeydown(e) {
  const isNumberKey = checkSymbolType(e.key) === 'number';
  const isOperatorKey = checkSymbolType(e.key) === 'operator';

  if (IS_CALCULATED && isNumberKey) {
    clearInputField();
    clearInputFieldExtra();
    IS_CALCULATED = false;
  }

  if (isOperatorKey) {
    IS_CALCULATED = false;
    numberSymbolCount = 0;

    const inputValue = refs.inputField.value;
    const lastSymbol = inputValue[inputValue.length - 1];
    const prevSymbol = inputValue[inputValue.length - 2];

    const prevSymbolType = checkSymbolType(prevSymbol);
    const lastSymbolType = checkSymbolType(lastSymbol);

    // --- for correct operators input --->
    // если пусто - вводить только "-"
    if (e.key !== '-' && inputValue === '') {
      e.preventDefault();
      return;
    }
    //если введён только "-" - при нажатии на "+" очищать инпут
    if (e.key === '+' && inputValue === '-') {
      e.preventDefault();
      clearInputField();
      return;
    }
    //если введён только один оператор и больше ничего - не вводить др. операторы
    if (inputValue.length === 1 && lastSymbolType === 'operator') {
      e.preventDefault();
      return;
    }
    // после оператора "+" можно ввести только "-"
    if (e.key !== '-' && lastSymbol === '+') {
      e.preventDefault();
      return;
    }

    if (e.key === '-' && lastSymbol === '-' && prevSymbolType !== 'operator') {
      refs.inputField.value = inputValue.slice(0, inputValue.length - 1) + '+';
    }

    if (e.key === '+' && lastSymbol === '-') {
      refs.inputField.value = inputValue.slice(0, inputValue.length - 1) + '+';
    }

    if (e.key === '+' && lastSymbol === '-' && prevSymbolType === 'number') {
      refs.inputField.value = inputValue.slice(0, inputValue.length - 1);
    }

    if (e.key === '+' && lastSymbol === '-' && prevSymbol === '+') {
      e.preventDefault();
      refs.inputField.value = inputValue.slice(0, inputValue.length - 1);
    }
    //не вводить больше 2-х операторов подряд
    if (prevSymbolType === 'operator' && lastSymbolType === 'operator') {
      e.preventDefault();
    }
    // не вводить 2 одинаковых оператора подряд
    if (e.key === lastSymbol) {
      e.preventDefault();
      return;
    }
    // <--- ------------ ---
  }

  // --- max length of number - 15 symbols --->
  if (isNumberKey) {
    numberSymbolCount += 1;
  }

  if (isNumberKey && numberSymbolCount > 15) {
    numberSymbolCount = 15;
    e.preventDefault();
    refs.inputFieldExtra.innerText = 'max length of number - 15 symbols';
    return;
  }

  if ((e.key === 'Backspace' || e.key === 'Delete') && numberSymbolCount > 0) {
    numberSymbolCount -= 1;
  }
  //<--- ------ ---

  if (e.key === '=') {
    onCalculateBtnClick(e);
  }

  if (e.key === ' ') {
    e.preventDefault();
  }
}

function onCalculateBtnClick(e) {
  e.preventDefault();

  const inputFieldIsEmpty = refs.inputField.value === '';

  if (inputFieldIsEmpty || IS_CALCULATED) return;

  const specialOperatorsList = ['%'];
  const specialOperatorsRegExp = new RegExp(
    `[${specialOperatorsList.join()}]`,
    'g',
  );

  const isSimpleExpression = !specialOperatorsRegExp.test(
    refs.inputField.value,
  );
  const result = isSimpleExpression
    ? calculate(refs.inputField.value)
    : calculate(EXPRESSION_FOR_CALCULATION);

  showResult(result);
  IS_CALCULATED = true;
}

function onInputChange(e) {
  if (e.target.id === 'input_field') {
    clearInputFieldExtra();
  }
}

function onUtilBtnClick(e) {
  if (e.target.value === '+/-') {
    const parsedInputValue = getParsedInputValue(refs.inputField.value);
    const cursorPosition = refs.inputField.selectionStart;
    const valueWithCursor = getValueWithCursor(
      parsedInputValue,
      cursorPosition,
    );

    let newInputValue = '';

    // do not add "-" to operator symbol
    if (checkSymbolType(valueWithCursor.text) === 'operator') {
      return;
    }

    const newItem = valueWithCursor.text.includes('-')
      ? valueWithCursor.text.replace('-', '')
      : `-${valueWithCursor.text}`;

    for (const item of parsedInputValue) {
      newInputValue =
        item.text === valueWithCursor.text
          ? (newInputValue += newItem)
          : (newInputValue += item.text);
    }

    refs.inputField.value = newInputValue;
  }
}

function onOperatorClick(e) {
  const parsedInputValue = getParsedInputValue(refs.inputField.value);

  if (e.target.value === '%') {
    let firstOperand = null;
    let secondOperand = null;
    let operator = null;
    let continueIteration = true;

    for (let i = parsedInputValue.length - 1; continueIteration; i -= 1) {
      const item = parsedInputValue[i];
      const isNumberItem = !isNaN(parseInt(item?.text));
      const isOperatorItem = checkSymbolType(item?.text) === 'operator';

      if (!secondOperand && isNumberItem) {
        secondOperand = parseInt(item.text) / 100;
        continue;
      }

      if (isOperatorItem && item.text !== '%') {
        operator = item.text;
        continue;
      }

      if (!firstOperand && isNumberItem) {
        firstOperand = parseInt(item.text);

        continueIteration = false;
        continue;
      }

      if (i <= 0) {
        continueIteration = false;
      }
    }

    EXPRESSION_FOR_CALCULATION = firstOperand
      ? `${firstOperand}${operator}${firstOperand * secondOperand}`
      : secondOperand;
  }
}

// === calculation ===>
function calculate(str) {
  const func = new Function(`return ${str}`);
  return func(str);
}
// <=== END calculation ====

// === utils ===>
function checkSymbolType(symbol) {
  const numbersList = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const operatorsList = ['+', '-', '*', '/', '%'];

  if (numbersList.includes(symbol)) return 'number';
  if (operatorsList.includes(symbol)) return 'operator';
}

function removeLastZero(str) {
  if (str[str.length - 1] !== '0') {
    return str;
  } else {
    return removeLastZero(str.slice(0, str.length - 1));
  }
}

function getValueWithCursor(valuesArr, cursorPosition) {
  const currentCursorPosition =
    cursorPosition > 0 ? cursorPosition - 1 : cursorPosition;

  for (const item of valuesArr) {
    if (item.indexes.includes(currentCursorPosition)) {
      return item;
    }
  }
}

function getParsedInputValue(value) {
  const symbols = value.split('');

  const result = [];
  let item = { text: '', indexes: [] };

  for (let i = 0; i <= symbols.length; i += 1) {
    const symbol = symbols[i];

    if (checkSymbolType(symbol) === 'number' || item.text === '') {
      item.text += symbol;
      item.indexes.push(i);
    } else {
      result.push({ ...item });

      if (symbol) {
        item.text = symbol;
        item.indexes = [];
        item.indexes.push(i);

        result.push({ ...item });

        item.text = '';
        item.indexes = [];
      }
    }
  }

  return result;
}
// <=== END utils====
