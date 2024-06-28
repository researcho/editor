import EventEmitter from 'events';

const createFileSystem = (baseHandle: FileSystemDirectoryHandle) => {
  let lastChange = Date.now();
  const emitter = new EventEmitter();

  const handleChange = () => {
    emitter.lastChange = Date.now();
    emitter.emit('change');
  }

  Object.assign(emitter, {
    lastChange,
    readDirectory: async (location) => {
      let dirHandle = baseHandle;
      if (location !== '/') {
        const parts = location.split('/').filter(Boolean);
        for (const part of parts) {
          dirHandle = await dirHandle.getDirectoryHandle(part, { create: false });
        }
      }
      const entries = [];
      for await (const entry of dirHandle.values()) {
        entries.push(entry);
      }
      return entries.sort((a, b) => a < b ? 1 : -1);
    },
    readFile: async (location) => {
      const parts = location.split('/').filter(Boolean);
      const fileName = parts.pop();
      let dirHandle = baseHandle;
      for (const part of parts) {
        dirHandle = await dirHandle.getDirectoryHandle(part, { create: false });
      }
      const fileHandle = await dirHandle.getFileHandle(fileName, { create: false });
      const file = await fileHandle.getFile();
      return await file.text();
    },
    writeFile: async (location, data) => {
      const parts = location.split('/').filter(Boolean);
      const fileName = parts.pop();
      let dirHandle = baseHandle;
      for (const part of parts) {
        dirHandle = await dirHandle.getDirectoryHandle(part, { create: true });
      }
      const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(data);
      await writable.close();
      handleChange();
    },
    deleteFile: async (location) => {
      const parts = location.split('/').filter(Boolean);
      const fileName = parts.pop();
      let dirHandle = baseHandle;
      for (const part of parts) {
        dirHandle = await dirHandle.getDirectoryHandle(part, { create: false });
      }
      await dirHandle.removeEntry(fileName);
      handleChange();
    },
    moveFile: async (sourceLocation, targetLocation) => {
      const sourceParts = sourceLocation.split('/').filter(Boolean);
      const sourceFileName = sourceParts.pop();
      let sourceDirHandle = baseHandle;
      for (const part of sourceParts) {
        sourceDirHandle = await sourceDirHandle.getDirectoryHandle(part, { create: false });
      }
      const sourceFileHandle = await sourceDirHandle.getFileHandle(sourceFileName, { create: false });

      const targetParts = targetLocation.split('/').filter(Boolean);
      const targetFileName = targetParts.pop();
      let targetDirHandle = baseHandle;
      for (const part of targetParts) {
        targetDirHandle = await targetDirHandle.getDirectoryHandle(part, { create: true });
      }
      const targetFileHandle = await targetDirHandle.getFileHandle(targetFileName, { create: true });

      const file = await sourceFileHandle.getFile();
      const writable = await targetFileHandle.createWritable();
      await writable.write(await file.arrayBuffer());
      await writable.close();

      await sourceDirHandle.removeEntry(sourceFileName);

      handleChange();
    },
    renameFile: async (oldLocation, newLocation) => {
      await this.moveFile(oldLocation, newLocation);

      handleChange();
    },
    copyFile: async (sourceLocation, targetLocation) => {
      const sourceParts = sourceLocation.split('/').filter(Boolean);
      const sourceFileName = sourceParts.pop();
      let sourceDirHandle = baseHandle;
      for (const part of sourceParts) {
        sourceDirHandle = await sourceDirHandle.getDirectoryHandle(part, { create: false });
      }
      const sourceFileHandle = await sourceDirHandle.getFileHandle(sourceFileName, { create: false });

      const targetParts = targetLocation.split('/').filter(Boolean);
      const targetFileName = targetParts.pop();
      let targetDirHandle = baseHandle;
      for (const part of targetParts) {
        targetDirHandle = await targetDirHandle.getDirectoryHandle(part, { create: true });
      }
      const targetFileHandle = await targetDirHandle.getFileHandle(targetFileName, { create: true });

      const file = await sourceFileHandle.getFile();
      const writable = await targetFileHandle.createWritable();
      await writable.write(await file.arrayBuffer());
      await writable.close();

      handleChange();
    },
  });

  return emitter;
};

export default createFileSystem;
