import { useState } from 'react';
import { Message } from './Message'; // Assuming you have a Message type defined

export const useRunAssistantState = () => {
  const [assistantId, setAssistantId] = useState('');
  const [inputMessage, setInputMessage] = useState('Whats the weather in Berlin?');
  const [threadId, setThreadId] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [runStatus, setRunStatus] = useState<string | null>(null);
  const [toolCallId, setToolCallId] = useState('');
  const [output, setOutput] = useState('');
  const [stepId, setStepId] = useState<string | null>(null);

  return {
    assistantId, setAssistantId, // Add this line
    inputMessage, setInputMessage,
    threadId, setThreadId,
    runId, setRunId,
    messages, setMessages,
    loading, setLoading,
    runStatus, setRunStatus,
    toolCallId, setToolCallId,
    output, setOutput,
    stepId, setStepId
  };
};