const fs = require('fs-extra');
const concat = require('concat');

if (process.argv.length != 3) {
    console.warn("Usage: npm run build:openvidu-webcomponent -- VERSION");
    console.warn('For example: "npm run build:openvidu-webcomponent -- 2.3.0"');
    process.exit(-1);
}
var VERSION = process.argv[2];

async function buildElement() {
  const files = [
    './dist/openvidu-call/runtime.js',
    './dist/openvidu-call/polyfills.js',
    './dist/openvidu-call/scripts.js',
    './dist/openvidu-call/main.js',
  ];

  try {
    await fs.ensureDir('openvidu-webcomponent');
    await concat(files, './openvidu-webcomponent/openvidu-webcomponent-' + VERSION + '.js')
    await fs.copy('./dist/openvidu-call/styles.css', './openvidu-webcomponent/openvidu-webcomponent-' + VERSION + '.css');
  } catch (err) {
    console.error('Error executing build funtion in webcomponent-builds.js', err);
  }
}

async function copyFiles() {
  const destination = '../../../openvidu-tutorials/openvidu-webcomponent/web';
  try {
    await fs.ensureDir('openvidu-webcomponent');
    await fs.copy('./openvidu-webcomponent/', destination);
  } catch (err) {
    console.error('Error executing copy function in webcomponent-builds.js', err);
  }
}

buildElement()
  .then(() => {
    return copyFiles();
  })
  .then(() => {
    console.log('OpenVidu Web Component (' + VERSION + ') built')
  });
