import React, { useEffect, useRef } from 'react';
import styled from '@emotion/styled';

// Styled components
const StyledDialog = styled.dialog`
  padding: 0;
  background-color: var(--base-bg-color);
  color: var(--base-fg-color);
  border: 5px solid rgba(255, 255, 255, 0.1);
  min-width: 400px;
  border-radius: 3px;
  margin-top: 30vh;

  &::backdrop {
    background-color: rgba(0, 0, 0, 0.6);
  }
`;

const DialogHeading = styled.div`
  display: flex;
  background-color: rgba(0, 0, 0, 0.5);
  color: var(--base-fg-color);
  padding: 10px;

  & > :first-child {
    flex-grow: 1;
  }

  & button {
    background-color: transparent;
    border: 0;
    cursor: pointer;
    color: var(--base-fg-color);
    border-radius: 3px;

    &:hover {
      background-color: rgba(255, 255, 255, 0.3);
    }
  }
`;

const DialogContent = styled.div`
  display: block;
  color: var(--base-fg-color);
  padding: 10px;
`;

function Modal({ onClose, title, children }) {
  const modalRef = useRef();

  useEffect(() => {
    if (!modalRef.current) {
      return;
    }

    modalRef.current.showModal();
    modalRef.current.addEventListener('close', () => {
      onClose();
    });
  }, [modalRef]);

  return (
    <StyledDialog ref={modalRef}>
      <DialogHeading>
        <span>{title}</span>
        <button onClick={onClose}>X</button>
      </DialogHeading>
      <DialogContent>
        {children}
      </DialogContent>
    </StyledDialog>
  );
}

export default Modal;
