import React, { useState, useRef } from 'react';
import styled from '@emotion/styled';
import classNames from 'classnames';
import { FileText, X } from 'react-bootstrap-icons';

// Styled components
const TabBarContainer = styled.div`
  ul {
    padding: 0;
    margin: 0;
    display: flex;
    list-style: none;
    overflow: auto;

    &::-webkit-scrollbar {
      height: 11px;
    }
  }
`;

const Tab = styled.li`
  cursor: move;
  display: flex;
  justify-content: center;
  align-items: center;
  white-space: nowrap;
  margin-right: 2px;
  color: var(--base-fg-color);
  background-color: rgba(0, 0, 0, 0.1);
  padding: 2px 6px 2px 2px;

  &.active {
    color: var(--base-fg-color);
    background-color: rgba(0, 0, 0, 0.3);
    font-weight: bold;
  }

  &:hover button {
    opacity: 1;
  }

  &.dragging {
    opacity: 0.5;
  }
`;

const Label = styled.span`
  display: inline-block;
  padding: 5px 10px;
`;

const TabButton = styled.button`
  opacity: 0;
  cursor: pointer;
  display: flex;
  padding: 0;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  color: white;
  border: none;
  font-size: 24px;

  &:hover {
    background-color: rgb(107, 26, 26);
  }
`;

const Icon = styled.span`
  margin-left: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

function TabBar({ tabs, onCloseTab, onSelectTab, onReorderTabs }) {
  const [draggedTab, setDraggedTab] = useState(null);
  const draggedOverTabRef = useRef(null);

  if (tabs.length === 0) {
    return null;
  }

  const handleTabClick = (tab) => {
    onSelectTab(tab.id);
  };

  const handleCloseTab = (tab, event) => {
    event.stopPropagation();
    onCloseTab(tab.id);
  };

  const handleDragStart = (e, tab) => {
    setDraggedTab(tab);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', tab.id);
    e.target.classList.add('dragging');
  };

  const handleDragOver = (e, tab) => {
    e.preventDefault();
    draggedOverTabRef.current = tab;
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
    if (draggedTab && draggedOverTabRef.current && draggedTab.id !== draggedOverTabRef.current.id) {
      const newTabs = [...tabs];
      const fromIndex = newTabs.findIndex(t => t.id === draggedTab.id);
      const toIndex = newTabs.findIndex(t => t.id === draggedOverTabRef.current.id);
      newTabs.splice(fromIndex, 1);
      newTabs.splice(toIndex, 0, draggedTab);
      onReorderTabs(newTabs);
    }
    setDraggedTab(null);
    draggedOverTabRef.current = null;
  };

  return (
    <TabBarContainer>
      <ul>
        {tabs.map((tab) => (
          <Tab
            onClick={() => handleTabClick(tab)}
            key={tab.id}
            className={classNames({ active: tab.active })}
            draggable
            onDragStart={(e) => handleDragStart(e, tab)}
            onDragOver={(e) => handleDragOver(e, tab)}
            onDragEnd={handleDragEnd}
          >
            <Icon>
              <FileText />
            </Icon>
            <Label>
              {tab.title} {tab.dirty && '*'}
            </Label>
            <TabButton onClick={(event) => handleCloseTab(tab, event)}>
              <X />
            </TabButton>
          </Tab>
        ))}
      </ul>
    </TabBarContainer>
  );
}

export default TabBar;
