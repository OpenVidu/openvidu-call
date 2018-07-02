const fs = require('fs-extra');
const concat = require('concat');

(async function build() {
  const files = [
    './dist/openvidu-call/runtime.js',
    './dist/openvidu-call/polyfills.js',
    './dist/openvidu-call/scripts.js',
    './dist/openvidu-call/main.js',
  ];

  await fs.ensureDir('elements');

  await concat(files, 'elements/openvidu-session.js');

  await fs.copyFile('./dist/openvidu-call/styles.css', 'elements/openvidu-session.css');

  await fs.copyFile('./dist/openvidu-call/assets/images/openvidu_logo.png', 'elements/assets/images/openvidu_logo.png');

})();

(async function copy() {
    
  await fs.ensureDir('elements');
  
  await fs.ensureDir('./elements/assets/images/');

  await fs.copy('./elements/assets/images/openvidu_logo.png', '../webComponent/assets/images/openvidu_logo.png');

  await fs.ensureFile('./elements/assets/images/favicon.ico');

  await fs.copyFile('./elements/assets/images/favicon.ico', '../webComponent/favicon.ico');

  await fs.ensureFile('./elements/openvidu-session.css');

  await fs.copyFile('./elements/openvidu-session.css', '../webComponent/openvidu-session.css');

  await fs.ensureFile('./elements/openvidu-session.js');
  
  await fs.copyFile('./elements/openvidu-session.js', '../webComponent/openvidu-session.js');

})();

