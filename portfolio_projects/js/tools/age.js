// js/tools/age.js
export function init() {
  const form = document.getElementById('age-form');
  if (form) form.addEventListener('submit', handleSubmit);
}

export function cleanup() {
  const form = document.getElementById('age-form');
  if (form) form.removeEventListener('submit', handleSubmit);
}

function handleSubmit(e) {
  e.preventDefault();
  const dobInput = document.getElementById('dob');
  const result = document.getElementById('age-result');
  if (!dobInput.value) {
    result.textContent = 'Please select your birth date.';
    return;
  }

  const birthDate = new Date(dobInput.value);
  const today = new Date();

  if (birthDate > today) {
    result.textContent = 'You entered a future date!';
    return;
  }

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  result.textContent = `${years} years, ${months} months, and ${days} days`;
}
