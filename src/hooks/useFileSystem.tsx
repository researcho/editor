import React, { useContext, useEffect, useState, useCallback } from 'react';
import { get, set } from 'idb-keyval';
import createFileSystem from '../services/createFileSystem';

interface FileSystemContextType {
  fs: any | null;
  lastChange: number;
  openFolder: () => Promise<void>;
}

const FileSystemContext = React.createContext<FileSystemContextType | null>(null);

export function FileSystemProvider({ children }: { children: React.ReactNode }) {
  const [fs, setFs] = useState<any | null>(null);
  const [lastChange, setLastChange] = useState<number>(0);

  const initializeFileSystem = useCallback(async (handle: FileSystemDirectoryHandle) => {
    const newFs = createFileSystem(handle);
    newFs.on('change', () => {
      setLastChange(Date.now())
    });
    setFs(newFs);
  }, []);

  useEffect(() => {
    get('handle').then(async (storedHandle) => {
      if (storedHandle) {
        initializeFileSystem(storedHandle);
      }
    });
  }, [initializeFileSystem]);

  const openFolder = useCallback(async () => {
    try {
      const newHandle = await window.showDirectoryPicker();
      await set('handle', newHandle);
      initializeFileSystem(newHandle);
    } catch (error) {
      console.error('Error opening folder:', error);
    }
  }, [initializeFileSystem]);

  return (
    <FileSystemContext.Provider value={{ fs, lastChange, openFolder }}>
      {children}
    </FileSystemContext.Provider>
  );
}

export function useFileSystem(): [any | null, number, () => Promise<void>] {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return [context.fs, context.lastChange, context.openFolder];
}

export default useFileSystem;
