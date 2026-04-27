const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async ()=>{
  const args = process.argv.slice(2);
  if(args.length < 2){
    console.error('Usage: node convert_with_puppeteer.js <input.html> <output.pdf>');
    process.exit(1);
  }
  const input = path.resolve(args[0]);
  const output = path.resolve(args[1]);
  if(!fs.existsSync(input)){
    console.error('Input file not found:', input);
    process.exit(2);
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('file://' + input, {waitUntil: 'networkidle0'});
  await page.pdf({path: output, format: 'A4', printBackground: true});
  await browser.close();
  console.log('Created', output);
})();
