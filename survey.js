(() => {
  const form = document.getElementById('intro-survey');
  const result = document.getElementById('survey-result');
  const fields = form.querySelector('fieldset');
  fields.disabled = false;
  const preference = document.getElementById('survey-contact');
  const phone = document.getElementById('survey-phone');
  function updatePhone() { phone.required = ['WhatsAppilla', 'Tekstiviestillä', 'Soittamalla'].includes(preference.value); }
  preference.addEventListener('change', updatePhone);
  updatePhone();
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
    } finally {sending = false; fields.disabled = false;}
  });
})();
