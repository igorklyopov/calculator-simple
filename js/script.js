function calculate(str) {
  const func = new Function(`return ${str}`);
  return func(str);
}
