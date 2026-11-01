(() => {
  const form = document.getElementById('intro-survey');
  const result = document.getElementById('survey-result');
  const fields = form.querySelector('fieldset');
  fields.disabled = false;
  // Require one answer in each checkbox group without requiring every option.
  form.querySelectorAll('[data-min-choice]').forEach(group => {
    const boxes = [...group.querySelectorAll('input[type="checkbox"]')];
    function validateGroup() {
      boxes[0].setCustomValidity(boxes.some(box => box.checked) ? '' : 'Valitse vähintään yksi vaihtoehto.');
    }
    group.addEventListener('change', validateGroup);
    form.addEventListener('reset', () => setTimeout(validateGroup, 0));
    validateGroup();
  });
  const preference = document.getElementById('survey-contact');
  const phone = document.getElementById('survey-phone');
  const email = document.getElementById('survey-email');
  function updatePhone() {
    const usePhone = ['WhatsAppilla', 'Tekstiviestillä', 'Soittamalla'].includes(preference.value);
    const useEmail = preference.value === 'Sähköpostilla';
    phone.required = usePhone; phone.disabled = !usePhone;
    email.required = useEmail; email.disabled = !useEmail;
    document.getElementById('phone-field').hidden = !usePhone;
    document.getElementById('email-field').hidden = !useEmail;
  }
  preference.addEventListener('change', updatePhone);
  updatePhone();
  // Native validation can stop a submit before the submit handler runs.
  // Explain the missing field in the page as well as the browser's tooltip.
  let invalidReported = false;
  form.addEventListener('invalid', event => {
    if (invalidReported) return;
    invalidReported = true;
    const input = event.target;
    const label = input.labels?.[0]?.textContent.trim().replace(/\s+/g, ' ') || 'Pakollinen kenttä';
    result.textContent = input.name === 'contact_permission'
      ? 'Lähetys odottaa yhteydenottolupaa. Rastita lupa, jos haluat Eskon ottavan sinuun yhteyttä.'
      : 'Tarkista kenttä: ' + label + '. ' + input.validationMessage;
    setTimeout(() => { invalidReported = false; }, 0);
  }, true);
  let sending = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    const data = new FormData(form);
    data.set('contact_permission', 'Kyllä, lupa yhteydenottoon');
    sending = true; fields.disabled = true;
    result.textContent = 'Lähetetään vastauksia…';
    try {
      const response = await fetch(form.action, {method:'POST', body:data, headers:{Accept:'application/json'}, signal:AbortSignal.timeout(20000)});
      if (!response.ok) throw new Error('Send failed');
      form.reset(); updatePhone();
      result.textContent = 'Kiitos vastauksistasi! Otan sinuun yhteyttä toivomallasi tavalla.';
    } catch {
      result.textContent = 'Lähetystä ei voitu vahvistaa. Vastauksesi ovat yhä lomakkeella. Voit yrittää uudelleen tai kirjoittaa osoitteeseen resonance.eskosavioja@gmail.com.';
    } finally {sending = false; fields.disabled = false; updatePhone();}
  });
})();
