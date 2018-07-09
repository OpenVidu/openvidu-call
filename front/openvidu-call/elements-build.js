const fs = require('fs-extra');
const concat = require('concat');

async function buildElement() {
  const files = [
    './dist/openvidu-call/runtime.js',
    './dist/openvidu-call/polyfills.js',
    './dist/openvidu-call/scripts.js',
    './dist/openvidu-call/main.js',
  ];

  try {
    await fs.ensureDir('elements');

    await concat(files, 'elements/openvidu-session.js');

    await fs.copy('./dist/openvidu-call/styles.css', './elements/openvidu-session.css');

    await fs.copy('./dist/openvidu-call/assets/images/openvidu_logo.png', './elements/assets/images/openvidu_logo.png');

    await fs.copy('./dist/openvidu-call/assets/images/favicon.ico', './elements/assets/images/favicon.ico');

  } catch (err) {
    console.error('Error executing build funtion in elements-builds.js', err);
  }
}

async function copyFiles() {
  const destination = '../../../openvidu-tutorials/openvidu-starter/web';

  try {

    await fs.ensureDir('elements');

    await fs.copy('./elements/', destination);

  } catch (err) {
    console.error('Error executing copy function in elements-builds.js', err);
  }
}

async function removeElement() {
  try {

    await fs.ensureDir('elements');
    
    await fs.remove('./elements/');

  } catch (err) {
    console.error('Error executing remove function in elements-builds.js', err);
  }
}
buildElement()
  .then(() => {
    return copyFiles();
  })
  .then(() => {
    removeElement();
  });
