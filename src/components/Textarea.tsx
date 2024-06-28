import React, { useRef, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import getSelectionInfo from '../utils/getSelectionInfo';

const TextareaContainer = styled.div`
  position: relative;
  width: 100%;
`;

const StyledTextarea = styled.div`
  display: block;
  white-space: pre-wrap;
  width: 100%;
  background-color: transparent;
  color: white;
  min-height: 2lh;
  padding: 8px;
  border: 1px solid transparent;
  resize: none;
  line-height: 1.5em;
  position: relative;

  &[contenteditable="plaintext-only"]::selection {
    background: transparent;
    color: transparent;
  }

  :focus {
    outline: none;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  ::before {
    content: attr(data-placeholder);
    position: absolute;
    top: 8px;
    left: 8px;
    color: rgba(255, 255, 255, 0.3);
    pointer-events: none;
    display: ${({ value }) => (value && value.trim() !== '' ? 'none' : 'block')};
  }
`;

const HighlightLayer = styled.div`
  position: absolute;
  pointer-events: none;
  white-space: pre-wrap;
  overflow: hidden;
  color: transparent;
  z-index: 9999;
  border: 1px solid transparent;
`;

const Textarea = React.forwardRef(({ readOnly, maxHeight, value, onChange, onSelect, className, placeholder, ...props }, ref) => {
  const [currentValue, setCurrentValue] = useState('');
  const _ref = useRef(null);
  const divRef = ref ?? _ref;
  const highlightRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (divRef.current && currentValue !== value) {
      divRef.current.innerText = value;
    }
    setCurrentValue(value);
    updateHighlight();
  }, [value]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      updateHighlightPosition();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    const handleSelectionChange = () => {
      if (document.activeElement === divRef.current) {
        updateHighlight();
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  const updateHighlightPosition = () => {
    if (divRef.current && highlightRef.current) {
      const rect = divRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      highlightRef.current.style.top = `${rect.top - containerRect.top}px`;
      highlightRef.current.style.left = `${rect.left - containerRect.left}px`;
      highlightRef.current.style.width = `${rect.width}px`;
      highlightRef.current.style.height = `${rect.height}px`;
      highlightRef.current.style.fontSize = window.getComputedStyle(divRef.current).fontSize;
      highlightRef.current.style.lineHeight = window.getComputedStyle(divRef.current).lineHeight;
      highlightRef.current.style.fontFamily = window.getComputedStyle(divRef.current).fontFamily;
      highlightRef.current.style.padding = window.getComputedStyle(divRef.current).padding;
    }
  };

  const handleInput = (event) => {
    const newContent = event.currentTarget.innerText || ' ';
    if (newContent !== currentValue) {
      onChange?.(newContent);
      setCurrentValue(newContent);
    }
    updateHighlight();
  };

  const updateHighlight = () => {
    if (highlightRef.current && divRef.current) {
      const { selectionStart, selectionLength } = getSelectionInfo(divRef.current);
      let highlightedContent = divRef.current.innerText;

      if (selectionStart !== null && selectionLength > 0) {
        highlightedContent =
          highlightedContent.substring(0, selectionStart) +
          '<span style="background-color: var(--var-text-selection-bg); color: var(--var-text-selection-fg);">' +
          highlightedContent.substring(selectionStart, selectionStart + selectionLength) +
          '</span>' +
          highlightedContent.substring(selectionStart + selectionLength);
      }

      highlightRef.current.innerHTML = highlightedContent;
      updateHighlightPosition();
    }
  };

  const style = maxHeight ? {
    maxHeight,
    overflowY: 'scroll'
  } : {};

  return (
    <TextareaContainer ref={containerRef}>
      <HighlightLayer ref={highlightRef} />
      <StyledTextarea
        className={className}
        style={style}
        contentEditable={!readOnly && "plaintext-only"}
        ref={divRef}
        onInput={handleInput}
        data-placeholder={placeholder}
        value={currentValue}
        {...props}
      />
    </TextareaContainer>
  );
});

export default Textarea;