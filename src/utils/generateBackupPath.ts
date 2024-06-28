const generateBackupPath = (originalFileName: string) => {
  const parts = originalFileName.split('/');

  const dirName = parts.slice(0, -1).join('/');
  const fileName = parts.slice(-1)[0];

  let finalPath = `${dirName}/.tmp-sew-${fileName}`

  if (finalPath.startsWith('/')) {
    finalPath = finalPath.slice(1);
  }

  return finalPath;
}

export default generateBackupPath;
