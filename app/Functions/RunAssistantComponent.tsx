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

  const { handleCreateAndRunThread, handleSubmitToolOutputs, handleAddMessageAndRun } = useRunAssistantUtilities(
    { 
      assistantId: stateAssistantId, 
      inputMessage, 
      threadId, 
      runId, 
      messages, 
      loading, 
      runStatus, 
      toolCallId, 
      output, 
      outputMessage, 
      stepId 
    }, 
    { 
      setAssistantId, 
      setInputMessage, 
      setThreadId, 
      setRunId, 
      setMessages, 
      setLoading, 
      setRunStatus, 
      setToolCallId, 
      setOutput, 
      setStepId 
    }
  );  
  
  

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
                setMessages(Array.isArray(messagesData) ? messagesData.reverse() : []);
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
    <div className="max-w-2xl mx-auto my-10">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="border-b border-gray-200 mb-4">
          <div className="text-sm font-medium text-gray-900">THREAD</div>
          <div className="text-xs text-gray-500">{threadId}</div>
        </div>
        <div className="flex flex-col">
        {messages.map((message, index) => (
  <div key={index} className="mb-4">
    <div className="flex items-center justify-between">
      <div className="text-sm font-medium text-gray-900">{message.role}</div>
      {runStatus === 'requires_action' && (
        <button className="text-xs text-blue-500 hover:text-blue-600">Cancel run</button>
      )}
    </div>
    {message.content.map((content, contentIndex) => (
      <div key={contentIndex} className="mt-1 text-sm text-gray-700">{content.text.value}</div>
    ))}
  </div>
))}
        </div>
        {runStatus === 'requires_action' && (
          <form onSubmit={handleSubmitToolOutputs} className="mb-4">
            <div className="bg-gray-50 rounded p-3">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={outputMessage}
                  onChange={(e) => setOutputMessage(e.target.value)}
                  placeholder="Enter your output message..."
                  className="flex-1 p-2 border border-gray-300 rounded mr-2 text-sm"
                />
                <button
                  type="submit"
                  className="text-xs text-blue-500 hover:text-blue-600"
                >
                  Submit
                </button>
              </div>
            </div>
          </form>
        )}
        <div className="flex items-center mt-auto">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Enter your message..."
            className="flex-1 p-2 border border-gray-300 rounded mr-2 text-sm"
          />
{!threadId && (
  <button
    onClick={handleCreateAndRunThread}
    className="text-xs text-blue-500 hover:text-blue-600"
    disabled={loading}
  >
    {loading ? 'Loading...' : 'Add and run'}
  </button>
)}
{threadId && (
  <button
    onClick={handleAddMessageAndRun}
    className="text-xs text-gray-500 ml-2"
  >
    Add
  </button>
)}
        </div>
        <div className="text-xs text-gray-400 mt-4">
          Playground messages can be viewed by anyone at your organization using the API.
        </div>
      </div>
    </div>
  );
    };
    
    export default RunAssistantComponent;