const shell = require('shelljs');

shell.cd('/root/temp')
shell.exec('unzip static.zip', (err) => {
  if (err) {
    console.log('unzip error', err);
    process.exit(1);
  }
  console.log('unzip success');
  shell.mv('static', `/root/workspace/anyway/server/public`)
})
