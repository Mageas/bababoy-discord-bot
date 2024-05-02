const { parse } = require('node-html-parser');

(async () => {
try {
  const response = await fetch("https://rentry.org/firehawk52");
  const text = await response.text();
  
  const html = parse(text);

  const rows = html.querySelectorAll('.ntable-wrapper')[1].querySelector('tbody').querySelectorAll('tr');

  for (const row of rows) {
    const tdElements = row.querySelectorAll('td');
    const country = tdElements[0].querySelector('img').getAttribute('src');
    const alt = tdElements[0].querySelector('img').getAttribute('alt');
    const plan = tdElements[1].text;
    const expiry = tdElements[2].text;
    const arl = tdElements[3].text;

    console.log({ alt, country, plan, expiry, arl });
  }
} catch (e) {
  console.log(e);
}
})();