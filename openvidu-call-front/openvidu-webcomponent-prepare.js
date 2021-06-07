const fs = require('fs-extra');
const { exit } = require('process');
const { forEachComment } = require('tslint');
const PROJECT = process.argv.slice(2)[0];

module.exports.prepareWebcomponent = function () {
	console.log('Preparing webcomponent files ...');
	if (PROJECT === 'pro') {
    const appModule = './projects/openvidu-call-pro/frontend/src/app/app.module.ts'
		replaceText(appModule, 'bootstrap: [AppProComponent]', '// bootstrap: [AppProComponent]');
  } else {
		const appModule = './src/app/app.module.ts';
		replaceText(appModule, 'bootstrap: [AppComponent]', '// bootstrap: [AppComponent]');
	}
};

function replaceText(file, originalText, changedText) {
	fs.readFile(file, 'utf8', (err, data) => {
		if (err) {
			return console.log(err);
		}
		let result = data.replace(originalText, changedText);

		fs.writeFile(file, result, 'utf8', (err) => {
			if (err) return console.log(err);
		});
	});
}


this.prepareWebcomponent();
