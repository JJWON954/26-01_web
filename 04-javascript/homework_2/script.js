const firstNumberInput = document.querySelector("#first-number");
const secondNumberInput = document.querySelector("#second-number");
const resultText = document.querySelector("#result");

const addButton = document.querySelector("#add-button");
const subtractButton = document.querySelector("#subtract-button");
const multiplyButton = document.querySelector("#multiply-button");
const divideButton = document.querySelector("#divide-button");

function getNumbers() {
  const firstNumber = Number(firstNumberInput.value);
  const secondNumber = Number(secondNumberInput.value);

  return { firstNumber, secondNumber };
}

function showResult(resultValue) {
  resultText.textContent = resultValue;
}

addButton.addEventListener("click", function () {
  const numbers = getNumbers();
  const result = numbers.firstNumber + numbers.secondNumber;

  showResult(result);
});

subtractButton.addEventListener("click", function () {
  const numbers = getNumbers();
  const result = numbers.firstNumber - numbers.secondNumber;

  showResult(result);
});

multiplyButton.addEventListener("click", function () {
  const numbers = getNumbers();
  const result = numbers.firstNumber * numbers.secondNumber;

  showResult(result);
});

divideButton.addEventListener("click", function () {
  const numbers = getNumbers();

  if (numbers.secondNumber === 0) {
    alert("0으로 나눌 수 없습니다.");
    return;
  }

  const result = numbers.firstNumber / numbers.secondNumber;

  showResult(result);
});

// C 버튼이 필요한 이유: 숫자 오입력시 입력값을 초기화 할 수 있음.