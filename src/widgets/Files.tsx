import { useEffect, useState, useRef, useCallback } from 'react';
import useFileSystem from '../hooks/useFileSystem';
import { PlusCircle, ChevronRight, ChevronDown, Folder, File, Recycle } from 'react-bootstrap-icons';
import styled from '@emotion/styled';
import { SidebarHeading } from '../components/Sidebar';
import generateBackupPath from '../utils/generateBackupPath';
import throttle from '../services/throttle';

const FileList = styled.ul`
  white-space: nowrap;
  padding: 0;
  margin: 0;
  list-style: none;
`;

const FileListItem = styled.li`
  cursor: pointer;
  padding: 8px 12px;
  display: flex;
  align-items: center;

  &:hover {
    background-color: rgba(0, 0, 0, 0.2);
  }
`;

const ContextMenu = styled.div`
  position: absolute;
  background-color: #000;
  z-index: 1000;
  padding: 4px;
  border-radius: 5px;
`;

const ContextMenuList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const ContextMenuItem = styled.li`
  padding: 5px 10px;
  cursor: pointer;

  &:hover {
    background-color: #262626;
  }
`;

const ToolbarButton = styled.button`
  width: 24px;
  height: 24px;
  padding: 4px;
  background-color: transparent;
  border: none;
  color: white;
  cursor: pointer;
`;

const IconWrapper = styled.span`
  margin-right: 8px;
`;

function FileTreeItem({ file, level, parentFileNames = [], onOpenFile, onContextMenu, fileNames }) {
  const [isOpen, setIsOpen] = useState(level === 0);
  const [children, setChildren] = useState([]);
  const [fs] = useFileSystem();

  const syncFiles = useCallback(async () => {
    if (file.kind === 'directory' && isOpen) {
      const childEntries = await fs.readDirectory(file.name);
      const childFiles = childEntries.map((entry) => ({
        name: `${file.name}/${entry.name}`,
        kind: entry.kind,
        hidden: entry.name.startsWith('.'),
      }));
      setChildren(childFiles);
    }
  }, [fs, file, isOpen]);

  useEffect(() => {
    syncFiles();
  }, [syncFiles]);

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleClick = () => {
    if (file.kind === 'file') {
      onOpenFile(file.name);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const fileHasBackup = parentFileNames.map(child => child.name).includes(generateBackupPath(file.name))
   || fileNames.includes(generateBackupPath(file.name));

  return (
    <>
      <FileListItem
        onClick={handleClick}
        onContextMenu={(e) => onContextMenu(e, file)}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
      >
        <IconWrapper onClick={handleToggle}>
          {file.kind === 'directory' ? (
            isOpen ? <ChevronDown /> : <ChevronRight />
          ) : (
            <File />
          )}
        </IconWrapper>
        <IconWrapper>
          {file.kind === 'directory' ? <Folder /> : null}
        </IconWrapper>
        {file.name.split('/').pop()}
        {fileHasBackup ? ' *' : null}
      </FileListItem>
      {isOpen && file.kind === 'directory' && (
        <FileList>
          {children
            .filter((child) => !child.hidden)
            .map((child) => (
              <FileTreeItem
                key={child.name}
                parentFileNames={children}
                file={child}
                level={level + 1}
                onOpenFile={onOpenFile}
                onContextMenu={onContextMenu}
                fileNames={fileNames}
              />
            ))}
        </FileList>
      )}
    </>
  );
}

function Files({ onToggle, onOpenFile }) {
  const [files, setFiles] = useState([]);
  const [fs, lastChange] = useFileSystem();
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const contextMenuRef = useRef();

  const syncFiles = useCallback(async () => {
    if (!fs) return;
    const rootEntries = await fs.readDirectory('/');
    const rootFiles = rootEntries.map((entry) => ({
      name: entry.name,
      kind: entry.kind,
      hidden: entry.name.startsWith('.'),
    }));
    setFiles(rootFiles);
  }, [fs]);

  const debouncedSyncFiles = useCallback(
    throttle(syncFiles, {
      minimumFlushTime: 1000,
      maximumFlushTime: 2000
    }),
    [syncFiles]
  );

  useEffect(() => {
    if (!fs) return;
    debouncedSyncFiles();
    const timer = setInterval(debouncedSyncFiles, 10000);
    return () => clearInterval(timer);
  }, [fs, lastChange, debouncedSyncFiles]);

  const handleContextMenu = (event, file) => {
    event.preventDefault();
    setSelectedFile(file);
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
  };

  const handleClose = () => setContextMenu(null);

  const handleFileOperation = async (operation, ...args) => {
    await operation(...args);
    debouncedSyncFiles();
    handleClose();
  };

  const handleRename = () => {
    const newName = prompt('Enter new name:', selectedFile.name.split('/').pop());
    if (newName && newName !== '') {
      const oldPath = selectedFile.name;
      const newPath = oldPath.split('/').slice(0, -1).concat(newName).join('/');
      handleFileOperation(fs.renameFile, oldPath, newPath);
    }
  };

  const handleDuplicate = () => {
    const oldPath = selectedFile.name;
    const newPath = `${oldPath}_copy`;
    handleFileOperation(fs.copyFile, oldPath, newPath);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedFile.name}?`)) {
      handleFileOperation(fs.deleteFile, selectedFile.name);
    }
  };

  const handleRefresh = (event) => {
    event.preventDefault();
    event.stopPropagation();
    debouncedSyncFiles();
  };

  const handleAddFile = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const newFileName = prompt('Enter the name of the new file:');
    if (newFileName && newFileName !== '') {
      handleFileOperation(fs.writeFile, newFileName, '');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fileNames = files.map((file) => file.name);

  return (
    <>
      <SidebarHeading onClick={onToggle}>
        <span>Files</span>
        <ToolbarButton onClick={handleAddFile}>
          <PlusCircle color="white" size="100%" />
        </ToolbarButton>
        <ToolbarButton onClick={handleRefresh}>
          <Recycle color="white" size="100%" />
        </ToolbarButton>
      </SidebarHeading>
      <div className="content" style={{ overflowY: 'scroll' }}>
        <FileList>
          {files
            .filter((file) => !file.hidden)
            .map((file) => (
              <FileTreeItem
                key={file.name}
                file={file}
                level={0}
                onOpenFile={onOpenFile}
                onContextMenu={handleContextMenu}
                fileNames={fileNames}
              />
            ))}
        </FileList>
      </div>
      {contextMenu && (
        <ContextMenu
          ref={contextMenuRef}
          style={{ top: contextMenu.mouseY, left: contextMenu.mouseX }}
        >
          <ContextMenuList>
            <ContextMenuItem onClick={handleRename}>Rename</ContextMenuItem>
            <ContextMenuItem onClick={handleDuplicate}>Duplicate</ContextMenuItem>
            <ContextMenuItem onClick={handleDelete}>Delete</ContextMenuItem>
          </ContextMenuList>
        </ContextMenu>
      )}
    </>
  );
}

export default Files;
