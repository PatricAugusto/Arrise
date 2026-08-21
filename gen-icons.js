const sharp = require('sharp');

async function render(input, output, size) {
  await sharp(input, { density: 384 }).resize(size, size).png().toFile(output);
  console.log('ok', output);
}

(async () => {
  // Ícone principal (full bleed, com fundo)
  await render('design/icon-full.svg', 'assets/icon.png', 1024);
  // Favicon (web)
  await render('design/icon-full.svg', 'assets/favicon.png', 196);
  // Android adaptive icon
  await render('design/icon-foreground.svg', 'assets/android-icon-foreground.png', 1024);
  await render('design/icon-monochrome.svg', 'assets/android-icon-monochrome.png', 1024);
  // Splash (fundo já é sólido via app.json, ícone precisa ser transparente)
  await render('design/icon-foreground.svg', 'assets/splash-icon.png', 1024);

  // Background adaptativo: cor sólida lisa
  await sharp({
    create: { width: 1024, height: 1024, channels: 4, background: '#0A0E17' }
  }).png().toFile('assets/android-icon-background.png');
  console.log('ok assets/android-icon-background.png');
})();