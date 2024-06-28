import uploadToBunny from 'upload-to-bunny';
import fs from 'fs';

const version = fs.readFileSync('./.VERSION', 'utf8').trim();

async function purgeCache (domain) {
  const response = await fetch(`https://europe-west2-personal-projects-341716.cloudfunctions.net/purge-bunny?domain=${domain}`, {
    method: 'POST',
    headers: {
      'authentication': process.env.PURGE_BUNNY_SECRET
    }
  });

  const json = await response.json();

  if (json.responseOk) {
    console.log('Successfully purged cache of ' + domain);
  } else {
    throw Object.assign(new Error('Could not purge cache of ' + domain), json);
  }
}

async function deploy () {
  await uploadToBunny('./dist', '', {
    storageZoneName: process.env.FTP_USERNAME,
    accessKey: process.env.FTP_PASSWORD,
    cleanDestination: false,
    maxConcurrentUploads: 10,
  });

  await uploadToBunny('./dist', 'v' + version, {
    storageZoneName: process.env.FTP_USERNAME,
    accessKey: process.env.FTP_PASSWORD,
    cleanDestination: false,
    maxConcurrentUploads: 10,
  });


  await purgeCache('editor.researcho.com');
}

deploy();