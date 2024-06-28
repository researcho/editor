import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';

import Notes from '../widgets/Notes';
import Warnings from '../widgets/Warnings';
import Files from '../widgets/Files';
import classNames from 'classnames';

// Styled components
const SidebarContainer = styled.div`
  grid-area: sidebar;
  background-color: rgba(255, 255, 255, 0.05);
  width: 300px;
`;

const SidebarList = styled.ul`
  padding: 0;
  margin: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const SidebarListItem = styled.li`
  --max-height: 30vh;
  &.grow {
    flex-grow: 1;
    --max-height: none;
  }
  &.expanded .content {
    max-height: var(--max-height);
    transition: max-height 0.1s ease-out;
  }
  &:not(.expanded) .content {
    max-height: 0;
    transition: max-height 0.1s ease-out;
  }
`;

export const SidebarHeading = styled.div`
  cursor: pointer;
  padding-left: 8px;
  display: flex;
  align-items: center;
  align-content: center;
  background-color: var(--base-bg-color);
  background-repeat: no-repeat;
  background-size: 16px;
  background-position: 5px center;

  &:not(:first-child) {
    margin-right: 5px;
  }

  & > :first-child {
    font-weight: bold;
    padding: 8px 8px 8px 0;
    flex-grow: 1;
  }
`;

const Pill = styled.span`
  border-radius: 4px;
  font-size: 0.9rem;
  padding: 3px;
  min-width: 20px;
  text-align: center;
  display: inline-block;

  &.pill-danger {
    background-color: rgb(135, 43, 43);
    color: var(--base-bg-color);
  }

  &.pill-warning {
    background-color: rgb(21, 108, 124);
    color: var(--base-bg-color);
  }
`;

function Sidebar({ onOpenFile }) {
  const [expanded, setExpanded] = useState({
    files: true,
    warnings: true,
    notes: true
  });

  const toggleExpanded = key => (event) => {
    setExpanded({
      ...expanded,
      [key]: !expanded[key]
    });
  }

  return (
    <SidebarContainer>
      <SidebarList>
        <SidebarListItem className={classNames({ expanded: expanded.files })}>
          <Files onOpenFile={onOpenFile} onToggle={toggleExpanded('files')} />
        </SidebarListItem>

        {/* <SidebarListItem className={classNames({ expanded: expanded.warnings })}>
          <Warnings onToggle={toggleExpanded('warnings')} />
        </SidebarListItem> */}

        <SidebarListItem className={classNames({ grow: true, expanded: expanded.notes })}>
          <Notes onToggle={toggleExpanded('notes')} />
        </SidebarListItem>
      </SidebarList>
    </SidebarContainer>
  )
}

export default Sidebar;
