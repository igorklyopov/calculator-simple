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

let IS_CALCULATED = false;

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
      break;

    case 'operator':
      IS_CALCULATED = false;
      input(e.target.value);
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

function showResult() {
  refs.inputFieldExtra.innerText = refs.inputField.value + '=';
  refs.inputField.value = calculate(refs.inputField.value);
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
  showResult();
  IS_CALCULATED = true;
}

function onInputChange(e) {
  if (e.target.id === 'input_field') {
    clearInputFieldExtra();
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
// <=== END utils====

// ===  ===>
// <=== END ====
