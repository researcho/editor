import React, { useState, useRef } from 'react';
import styled from '@emotion/styled';
import { XCircle } from 'react-bootstrap-icons';
import Textarea from './Textarea';
import useTabStore from '../stores/useTabstore.tsx';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.05);
`;

const Title = styled.div`
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  align-content: center;
  background-color: var(--base-bg-color);
`;

const StopButton = styled(XCircle)`
  cursor: pointer;
  margin-left: auto;
  color: red;
`;

function AssistantBar({ selection }) {
  const [value, setValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef(null);
  const patchTabById = useTabStore(state => state.patchById);
  const activeTab = useTabStore(state => state.getActive());

  const streamChatMessage = async (prompt, model) => {
    abortControllerRef.current = new AbortController();

    setIsStreaming(true);
    try {
      const selectionStart = selection.selectionStart;
      const selectionLength = selection.selectionLength;
      const contentBefore = activeTab.content.slice(0, selectionStart);
      const contentAfter = activeTab.content.slice(selectionStart + selectionLength);
      const contentWithPlaceholder = contentBefore + '[[AI_INSERT_HERE]]' + contentAfter;

      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are being used to write the content in a piece of software. You will be provided with the existing content, and then an instruction to append something onto that document. Every bit of your reply will be added to the document, so do not add any additional commentary of confirmations. Only reply with the exact content that should be appended to the document.' },
            { role: 'user', content: `
              The user is asking you to write a paragraph that they will insert where the token [[AI_INSERT_HERE]] currently is in this document:

              \`\`\`text
              ${contentWithPlaceholder}
              \`\`\`

              Their instruction is:

              \`\`\`text
              ${prompt}
              \`\`\`

              Notes:
              - only reply with the replacement text you think would be a great addition to that document.
              - do not reply with the existing content. only what will be replaced at [[AI_INSERT_HERE]]
              - do not wrap it in any markdown tags
              - do not add any commentary
              - do not reply with the existing content, only the content to append
            ` }
          ],
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.body) {
        throw new Error('ReadableStream not yet supported in this browser.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let generatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const jsonResponse = JSON.parse(decoder.decode(value));
        generatedContent += jsonResponse.message.content;

        // Replace the placeholder with the current generated content
        const updatedContent = contentWithPlaceholder.replace('[[AI_INSERT_HERE]]', generatedContent);

        patchTabById(activeTab.id, {
          backupSynced: false,
          content: updatedContent,
        });
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Stream aborted');
      } else {
        console.error(error);
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyPress = async (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const prompt = value;
      const model = 'llama3:instruct';
      setValue('');

      await streamChatMessage(prompt, model);
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <Wrapper>
      <Title>
        Assistant
        {isStreaming && <StopButton size={20} onClick={handleStop}/>}
      </Title>
      <Textarea readOnly={activeTab.readOnly} placeholder={activeTab.readOnly ? 'Assistant can not edit read only files' : 'Ask the assistant to add some more content to your document'} maxHeight="20vh" value={value} onChange={setValue} onKeyPress={handleKeyPress} />
    </Wrapper>
  );
}

export default AssistantBar;
