// 将dist目录打包成zip，然后通过上传到服务器的某个目录，服务器要解压
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const { NodeSSH } = require('node-ssh');

const ssh = new NodeSSH();

const srcPath = path.resolve(__dirname, '../dist');
const staticZipFileName = 'static.zip';
const staticZipPath = `${__dirname}/${staticZipFileName}`;

function uploadFile() {
  ssh.connect({
    host: '47.99.157.51',
    username: 'root',
    password: 'Nodeserver1',
    port: 22,
  }).then(() => {
    ssh.putFile(
      staticZipPath, // local path
      '/root/temp/static.zip' // remote path
    ).then(() => {
      console.log('上传成功');
      ssh.execCommand('node deploy_static.js', { cwd: '/root/workspace/anyway/server/scripts' })
        .then((result) => {
          console.log(`远端解压脚本输出: ${result.stdout}`);
          if (result.stderr) {
            console.log('Something wrong:', result);
            process.exit(0);
          }
        });;
    }).catch(e => console.log(e));
  }).catch(e => console.log(e));
}

function zip() {
  const output = fs.createWriteStream(staticZipPath);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });
  output.on('close', function(err) {
    if (err) {
      console.log('压缩文件异常', err);
      return;
    }
    console.log(archive.pointer() + ' total bytes');
    console.log('开始上传到服务器...');

    uploadFile();
  });
  archive.pipe(output);
  archive.directory(srcPath, '/static');
  archive.finalize();
}

zip();

