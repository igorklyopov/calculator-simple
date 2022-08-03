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

  const inputFieldIsEmpty = refs.inputField.value.trim() === '';

  switch (e.target.dataset.type) {
    case 'number':
      input(e);
      break;

    case 'util':
      break;

    case 'operator':
      input(e);
      break;

    case 'reset':
      clearInputFieldExtra();
      break;

    case 'submit':
      e.preventDefault();
      if (inputFieldIsEmpty || IS_CALCULATED) return;
      showResult();
      IS_CALCULATED = true;
      break;

    default:
      break;
  }

  function input(e) {
    if (IS_CALCULATED) {
      clearInputField();
      clearInputFieldExtra();
      IS_CALCULATED = false;
    }

    refs.inputField.value += e.target.value;
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
}

function calculate(str) {
  const func = new Function(`return ${str}`);
  return func(str);
}
