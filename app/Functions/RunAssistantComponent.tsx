"use client"

import React, { useEffect,useState } from 'react';
import { useRunAssistantState } from './runAssistantState';
import { useRunAssistantUtilities } from './runAssistantUtils';
import * as Services from './runAssistantServices';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from "@/components/ui";

interface RunAssistantProps {
  assistantId: string;
}

const RunAssistantComponent: React.FC<RunAssistantProps> = ({ assistantId }) => {
  const {
    assistantId: stateAssistantId, setAssistantId,
    inputMessage, setInputMessage,
    threadId, setThreadId,
    runId, setRunId,
    messages, setMessages,
    loading, setLoading,
    runStatus, setRunStatus,
    toolCallId, setToolCallId,
    output, setOutput,
    stepId, setStepId
  } = useRunAssistantState();
  
  const [outputMessage, setOutputMessage] = useState('');



  const { handleCreateAndRunThread, handleSubmitToolOutputs } = useRunAssistantUtilities({ assistantId: stateAssistantId, inputMessage, threadId, runId, messages, loading, runStatus, toolCallId, output, stepId }, { setAssistantId, setInputMessage, setThreadId, setRunId, setMessages, setLoading, setRunStatus, setToolCallId, setOutput, setStepId });

    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;
        if (threadId && runId && runStatus !== 'requires_action') {
        intervalId = setInterval(async () => {
            const statusData = await Services.runAssistantCheckRunStatus(threadId, runId);
            setRunStatus(statusData.status);
            if (statusData.status === 'requires_action') {
            const toolCallId = statusData.required_action.submit_tool_outputs.tool_calls[0].id;
            setToolCallId(toolCallId);
            clearInterval(intervalId!); // Clear the interval when status is 'requires_action'
            } else if (statusData.status === 'completed') {
            clearInterval(intervalId!);
            const messagesData = await Services.runAssistantListMessages(threadId);
            setMessages(Array.isArray(messagesData) ? messagesData : []);
            }
        }, 1000);
        }
        return () => {
        if (intervalId) {
            clearInterval(intervalId);
        }
        };
    }, [threadId, runId, runStatus]); 
    useEffect(() => {
        setAssistantId(assistantId);
      }, [assistantId]);




      
  return (
    <Card>
      <CardHeader>
        <CardTitle>Run Assistant</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateAndRunThread} className="mb-4 flex gap-2">
          <Input
            value={stateAssistantId}
            onChange={(e) => setAssistantId(e.target.value)}
            
            required
          />
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Enter a message"
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Run Assistant'}
          </Button>
        </form>

        {runStatus === 'requires_action' && (
  <form onSubmit={handleSubmitToolOutputs} className="mb-4 flex gap-2">
    <Input
      value={output}
      onChange={(e) => setOutput(e.target.value)}
      placeholder="Enter output"
      required
    />
    <Button type="submit">
      Submit Output
    </Button>
  </form>
)}

        {messages.map((message) => (
          <Card key={message.id}>
            <CardHeader>
              <CardTitle>Message {message.id}</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Role:</strong> {message.role}</p>
              {message.content.map((content, index) => 
                content.type === 'text' ? (
                  <p key={index}>
                    <strong>Content:</strong> 
                    {typeof content.text === 'string' ? content.text : `Value: ${content.text.value}, Annotations: ${content.text.annotations}`}
                  </p>
                ) : null
              )}
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}

export default RunAssistantComponent;