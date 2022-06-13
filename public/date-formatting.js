const toDate = date => new Intl.DateTimeFormat('en-UK', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
}).format(new Date(date));
document.querySelectorAll('.js-date').forEach(date => date.textContent = toDate(date.textContent));
