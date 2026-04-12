const clubForm = document.querySelector("#club-form");
const studentNameInput = document.querySelector("#student-name");
const studentIdInput = document.querySelector("#student-id");
const studentEmailInput = document.querySelector("#student-email");
const clubNameInput = document.querySelector("#club-name");
const partSelect = document.querySelector("#part");
const reasonInput = document.querySelector("#reason");

function createAlertMessage() {
  const name = studentNameInput.value;
  const id = studentIdInput.value;
  const email = studentEmailInput.value;
  const club = clubNameInput.value;
  const part = partSelect.value;
  const reason = reasonInput.value;

  return `지원해주셔서 감사합니다!

이름: ${name}
학번: ${id}
이메일: ${email}
관심 동아리: ${club}
지원 분야: ${part}
지원 이유: ${reason}`;
}

clubForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const message = createAlertMessage();
  alert(message);
});