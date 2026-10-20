export function bindPayrollPreviewInvalidation(form, result, error) {
  const invalidate = () => {
    result.textContent = 'Underlaget har ändrats. Förhandsgranska lönen igen innan du sparar.';
    error.textContent = '';
  };
  form.addEventListener('input', invalidate);
  form.addEventListener('change', invalidate);
  return invalidate;
}
