const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 }); // Tamaño de ventana más grande
  await page.goto('http://localhost:3000/animals');
  await page.screenshot({ path: 'screenshot_full.png', fullPage: true }); // Captura de pantalla completa
  console.log('Captura de pantalla guardada como screenshot_full.png');
  await browser.close();
})();