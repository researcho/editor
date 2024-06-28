import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';

import './App.css';
import WelcomeModal from './widgets/WelcomeModal.tsx';
import Sidebar from './components/Sidebar.tsx';
import TabBar from './components/TabBar.tsx';
import Textarea from './components/Textarea.tsx';

import logo from './images/favicon-32x32.png';
import useFileSystem from './hooks/useFileSystem.tsx';
import useTabStore from './stores/useTabstore.tsx';
import AssistantBar from './components/AssistantBar.tsx';
import { Download, Globe2, MenuApp, SaveFill } from 'react-bootstrap-icons';
import MenuBar from './components/MenuBar.tsx';
import generateBackupPath from './utils/generateBackupPath.ts';
import getSelectionInfo from './utils/getSelectionInfo.ts';

const Menu = styled.div`
  display: flex;
  gap: 8px;
  grid-area: menu;
  background-color: rgba(255, 255, 255, 0.05);
`;

const Tabbar = styled.div`
  grid-area: tabbar;
  background-color: rgba(255, 255, 255, 0.05);
`;

const Editor = styled.div`
  flex-direction: row;
  grid-area: editor;
  padding: 30px;
  padding-bottom: 50vh;
  background-color: rgba(255, 255, 255, 0.05);
  overflow: auto;

  > div {
    flex-grow: 1;
    outline: none;
    padding: 12px;
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const Assistantbar = styled.div`
  grid-area: assistantbar;
`;

const Footer = styled.div`
  grid-area: footer;
  padding: 5px 10px 10px 10px;
  background-color: rgba(255, 255, 255, 0);
  font-size: 0.9rem;

  ul {
    display: flex;
    margin: 0;
    padding: 0;
    list-style: none;

    li:not(:last-child):after {
      content: '|';
      margin-left: 5px;
      margin-right: 5px;
      color: rgba(255, 255, 255, 0.3);
    }
  }
`;

const Logo = styled.span`
  display: flex;
  align-items: center;
  align-content: center;
  padding: 12px;

  img {
    width: 16px;
    margin-right: 10px;
    margin-top: -3px;
  }
`;

const Dragger = styled.div`
  position: fixed;
  display: flex;
  width: 5px;
  place-content: center;
  align-items: center;
  user-select: none;

  &:not(.dragging):hover {
    cursor: ew-resize;
    background-color: rgba(255, 255, 255, 0.3);
  }
`;

function generateContentStats(content) {
  const charCount = content.length;
  const wordCount = content.trim().split(/\s+/).length;
  const sentenceCount = content.split(/[.!?]+/).filter(Boolean).length;
  const paragraphCount = content.split(/\n+/).filter(Boolean).length;

  return {
    charCount,
    wordCount,
    sentenceCount,
    paragraphCount,
  };
}

function App() {
  const [fs] = useFileSystem();
  const [menuItems, setMenuItems] = useState([]);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const activeTabRef = useRef();
  const [selection, setSelection] = useState();

  const tabs = useTabStore(state => state.tabs);
  const addTab = useTabStore(state => state.add);
  const removeTabById = useTabStore(state => state.removeById);
  const setActiveTabById = useTabStore(state => state.setActiveById);
  const patchTabById = useTabStore(state => state.patchById);
  const setTabs = useTabStore(state => state.setTabs);
  const activeTab = useTabStore(state => state.getActive());

  useEffect(() => {
    const fn = () => {
      const selection = getSelectionInfo(activeTabRef.current);
      if (selection.cursorPosition === null && selection.selectionLength === null && selection.selectionStart === null) {
        return;
      }
      setSelection(selection);
    }
    document.addEventListener('selectionchange', fn);

    return () => {
      document.removeEventListener('selectionchange', fn);
    }
  }, [activeTabRef?.current])

  useEffect(() => {
    return useTabStore.subscribe((newState) => {
      newState.tabs
        .filter(tab => !tab.backupSynced && tab.fileName)
        .forEach(async tab => {
          const fullName = generateBackupPath(tab.fileName);

          try {
            await fs.writeFile(fullName, tab.content);
          } catch (error) {
            console.error(`Failed to create backup for ${tab.fileName}:`, error);
          }
        });
    });
  }, [fs, useTabStore]);

  useEffect(() => {
    if (fs) {
      setShowWelcomeModal(false);
    }
  }, [fs]);

  useEffect(() => {
    const newMenuItems = [{
      title: 'Project',
      icon: Globe2,
      children: [{
        title: 'Export',
        icon: Download,
        children: [{
          title: 'PDF',
          action: () => {
            alert('Will save as pdf')
          }
        }, {
          title: 'HTML',
          action: () => {
            alert('Will save as html')
          }
        }]
      }]
    }, {
      title: 'File',
      icon: MenuApp,
      children: [{
        title: 'Save',
        icon: SaveFill,
        action: async () => {
          if (activeTab.readOnly) {
            alert('Can not save read only file');
            return;
          }
          await fs.writeFile(activeTab.fileName, activeTab.content);
          await fs.deleteFile(generateBackupPath(activeTab.fileName));
          patchTabById(activeTab.id, {
            dirty: false,
            backupSynced: true,
          });
        }
      }]
    }];

    setMenuItems(newMenuItems);
  }, [activeTab]);

  const onOpenFile = async (file) => {
    const isAlreadyOpen = tabs.find(t => t.title === file);
    if (isAlreadyOpen) {
      setActiveTabById(isAlreadyOpen.id);
      return;
    }

    const backupName = generateBackupPath(file);
    const tempContent = await fs.readFile(backupName).catch(error => null);

    addTab({
      fileName: file,
      title: file,
      content: tempContent || await fs.readFile(file, 'utf8'),
      dirty: Boolean(tempContent),
      backupSynced: true,
      active: true
    });
  };

  const handleChange = async (newContent) => {
    patchTabById(activeTab.id, {
      dirty: true,
      backupSynced: false,
      content: newContent
    });
  };

  const contentStats = activeTab ? generateContentStats(activeTab.content) : {
    charCount: 0,
    wordCount: 0,
    sentenceCount: 0,
    paragraphCount: 0
  };

  const handleReorderTabs = (oldIndex, newIndex) => {
    const newTabs = Array.from(tabs);
    const [reorderedItem] = newTabs.splice(oldIndex, 1);
    newTabs.splice(newIndex, 0, reorderedItem);

    // Update the order property for each tab
    newTabs.forEach((tab, index) => {
      patchTabById(tab.id, { order: index });
    });
  };

  return (
      <>
        <Menu>
          <Logo className="logo">
            <img src={logo} />
            <span>Researcho <strong>Editor</strong></span>
          </Logo>
          <MenuBar items={menuItems} />
        </Menu>
        <Tabbar>
          <TabBar
            tabs={tabs}
            onCloseTab={removeTabById}
            onSelectTab={setActiveTabById}
            onReorderTabs={(newTabs) => setTabs(newTabs)}
          />
        </Tabbar>
        <Editor>
          {activeTab && (
            <Textarea value={activeTab.content} readOnly={activeTab.readOnly} ref={activeTabRef} onChange={handleChange} />
          )}
        </Editor>
        {activeTab && (
          <Assistantbar>
            <AssistantBar selection={selection} />
          </Assistantbar>
        )}
        <Sidebar onOpenFile={onOpenFile} />
        {showWelcomeModal && (
          <WelcomeModal
            onClose={() => setShowWelcomeModal(false)}
          />
        )}
        <Footer>
          <ul>
            <li><span>{contentStats.charCount}</span> <strong>characters</strong></li>
            <li><span>{contentStats.wordCount}</span> <strong>words</strong></li>
            <li><span>{contentStats.sentenceCount}</span> <strong>sentences</strong></li>
            <li><span>{contentStats.paragraphCount}</span> <strong>paragraphs</strong></li>
            <li><strong>Selection:</strong> <span>{selection?.selectionStart}+{selection?.selectionLength}</span></li>
          </ul>
        </Footer>
      </>
  );
}

export default App;
