import info from '../../package.json' assert { type: 'json' };

export default {
  tasks: [{
    hostname: process.env.FTP_HOSTNAME,
    username: process.env.FTP_USERNAME,
    password: process.env.FTP_PASSWORD,
    source: './dist',
    destination: 'v' + info.version
  }]
}
