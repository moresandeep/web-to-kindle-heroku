const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer');
const execFile = require('child_process').execFile;
const fs = require('fs');
const sharp = require('sharp');

const PORT = process.env.PORT || 3000;

const FILENAME = 'screenshot.png';
const PATH = '/tmp/';
const CONVERTED_FILE = 'screenshot_grey.png'

//https://merrysky.net/forecast/Hudson,%20OH/us
const URL = 'https://world-weather.info/forecast/usa/hudson_6/';

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', async (req, res) => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 600, height: 800 });
    await page.goto(process.env.SCREENSHOT_URL || URL);
    await page.screenshot({
      path: PATH+FILENAME,
    });

    await browser.close();

    await convert(PATH, FILENAME);
    screenshot = fs.readFileSync(PATH+CONVERTED_FILE);

    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': screenshot.length,
    });
    return res.end(screenshot);
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

/* use sharp library insted of imagemagic convert utility */
function convert(PATH, FILENAME) {
  return new Promise((resolve, reject) => {
    sharp(PATH+FILENAME)
    .greyscale() // make it greyscale
    .resize({
      width: 600,
      height: 800,
      fit: sharp.fit.fill,
      position: sharp.gravity.center
    })
    .linear(1.5, 0) // increase the contrast
    .toFile(PATH+CONVERTED_FILE)
    .then( data => { resolve();})
    .catch( err => { console.error({err});
    reject();});
  });

}

function convert1(filename) {
  return new Promise((resolve, reject) => {
    const args = [filename, '-gravity', 'center', '-extent', '600x800', '-colorspace', 'gray', '-depth', '8', filename];
    execFile('convert', args, (error, stdout, stderr) => {
      if (error) {
        console.error({ error, stdout, stderr });
        reject();
      } else {
        resolve();
      }
    });
  });
}
