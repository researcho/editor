import React from 'react';
import styled from '@emotion/styled';
import { SidebarHeading } from '../components/Sidebar';

// Styled components
const NotesContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Heading = styled.div`
  cursor: pointer;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const Textarea = styled.textarea`
  background-color: transparent;
  border: 0;
  padding: 8px;
  outline: none;
  resize: none;
  color: white;
  flex-grow: 1;
`;

function Notes({ onToggle }) {
  return (
    <NotesContainer>
      <SidebarHeading onClick={onToggle}>
        <span>Notes</span>
      </SidebarHeading>
      <Content>
        <Textarea />
      </Content>
    </NotesContainer>
  );
}

export default Notes;
