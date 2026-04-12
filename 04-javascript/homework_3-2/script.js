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

// 배열은 랜덤 문구 예제에 필요하고, 조건문은 계산기 예제에 필요한 이유:
// 배열은 데이터를 묶고 관리하는데 유용하고, 조건문은 선택 및 분기점이 필요한 상황에서 유용하다.
// 따라서 랜덤 문구 예제에서는 여러 문구 중 하나를 도출함 -> 데이터를 묶는 배열 필요.
// 계산기 예제에서는 입력된 수와 연산자에 따라 다른 결과 도출함 -> 선택 및 분기점이 필요한 조건문 필요.