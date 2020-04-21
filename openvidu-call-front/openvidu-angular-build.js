const fs = require('fs-extra');

const mainComponentDest = './projects/openvidu-angular/src/lib/openvidu-angular.component.ts';
const videoRoomDest = './projects/openvidu-angular/src/lib/video-room/';
const sharedDest = './projects/openvidu-angular/src/lib/shared/';
const environmentDest = './projects/openvidu-angular/src/lib/environments/';

async function copyFiles() {
  try {
    await fs.copy('./src/app/video-room/', videoRoomDest);
    await fs.copy('./src/app/shared/', sharedDest);
    await fs.copy('./src/environments/', environmentDest);

    // Updating code
    // video-room selector
    fs.readFile(mainComponentDest, 'utf8', (err, data) => {
      if (err) {
        return console.log(err);
      }
      let result = data.replace("selector: 'opv-openvidu-session',", "selector: 'opv-session',");

      fs.writeFile(mainComponentDest, result, 'utf8', (err) => {
        if (err) return console.log(err);
      });

      //Remove router navigate
      fs.readFile(videoRoomDest + 'video-room.component.ts', 'utf8', (err, data) => {
        if (err) {
          return console.log(err);
        }
        let result = data.replace("this.router.navigate(['']);", "");

        fs.writeFile(videoRoomDest + 'video-room.component.ts', result, 'utf8', (err) => {
          if (err) return console.log(err);
        });
      });

      // openvidu-service environments path
      replaceEnvironmentPath(sharedDest + 'services/logger/logger.service.ts');
      replaceEnvironmentPath(sharedDest + 'services/network/network.service.ts');
    });
  } catch (err) {
    console.error('Error executing copy function in openvidu-angular-build.js', err);
  }
}

function replaceEnvironmentPath(file){
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      return console.log(err);
    }
    const result = data.replace('../../../environments/environment', '../../environments/environment');

    fs.writeFile(file, result, 'utf8', (err) => {
      if (err) return console.log(err);
    });
  });
}

async function cleanLibrary() {
  try {
    await fs.ensureDir(videoRoomDest);
    await fs.remove(videoRoomDest);
    await fs.ensureDir(sharedDest);
    await fs.remove(sharedDest);
    await fs.ensureDir(environmentDest);
    await fs.remove(environmentDest);
  } catch (err) {
    console.error('Error executing clean library function in openvidu-angular-build.js', err);
  }
}
cleanLibrary()
  .then(() => {
    copyFiles();
  })
  .catch((error) => console.error(error));
