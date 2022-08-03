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
  const isNumberKey = /[0-9]/.test(e.key);
  const isOperatorKey = /[+,\-,*,/]/.test(e.key);

  if (IS_CALCULATED && isNumberKey) {
    clearInputField();
    clearInputFieldExtra();
    IS_CALCULATED = false;
  }

  if (isOperatorKey) {
    IS_CALCULATED = false;
  }

  if (e.key === '=') {
    onCalculateBtnClick(e);
  }
}

function onCalculateBtnClick(e) {
  e.preventDefault();

  const inputFieldIsEmpty = refs.inputField.value.trim() === '';

  if (inputFieldIsEmpty || IS_CALCULATED) return;
  showResult();
  IS_CALCULATED = true;
}

function calculate(str) {
  const func = new Function(`return ${str}`);
  return func(str);
}
