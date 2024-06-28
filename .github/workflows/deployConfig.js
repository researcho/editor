import fs from 'fs';

const version = fs.readFileSync('./.VERSION', 'utf8').trim();

export default {
  tasks: [{
    hostname: process.env.FTP_HOSTNAME,
    username: process.env.FTP_USERNAME,
    password: process.env.FTP_PASSWORD,
    source: './dist',
    destination: ''
  }, {
    hostname: process.env.FTP_HOSTNAME,
    username: process.env.FTP_USERNAME,
    password: process.env.FTP_PASSWORD,
    source: './dist',
    destination: 'v' + version
  }]
}
