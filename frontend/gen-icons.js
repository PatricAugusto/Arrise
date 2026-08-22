const sharp = require('sharp');

async function render(input, output, size) {
  await sharp(input, { density: 384 }).resize(size, size).png().toFile(output);
  console.log('ok', output);
}

(async () => {
  // Shared cyberpunk mark used by every platform asset.
  await render('assets/arrise-mark.svg', 'assets/icon.png', 1024);
  await render('assets/arrise-mark.svg', 'assets/favicon.png', 196);
  await render('assets/arrise-foreground.svg', 'assets/android-icon-foreground.png', 1024);
  await render('assets/arrise-monochrome.svg', 'assets/android-icon-monochrome.png', 1024);
  await render('assets/arrise-foreground.svg', 'assets/splash-icon.png', 1024);

  // Background adaptativo: cor sólida lisa
  await sharp({
    create: { width: 1024, height: 1024, channels: 4, background: '#06080C' }
  }).png().toFile('assets/android-icon-background.png');
  console.log('ok assets/android-icon-background.png');
})();