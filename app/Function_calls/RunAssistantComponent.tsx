"use client"

import { useEffect, useState } from 'react';
import { createAndRunThread, listMessages, checkRunStatus, submitToolOutputs, listRunSteps, retrieveRunStep } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from "@/components/ui";

// Define the structure of a message
interface Message {
  id: string;
  role: string;
  content: Array<{ type: string, text: string }>; // content is an array of objects
}

// Define the props for the RunAssistantComponent
interface RunAssistantProps {
  assistantId: string;
}

const RunAssistantComponent: React.FC<RunAssistantProps> = ({ assistantId }) => {
  // Define state variables
  const [inputMessage, setInputMessage] = useState('Whats the weather in Berlin?');
  const [threadId, setThreadId] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [runStatus, setRunStatus] = useState<string | null>(null);
  const [toolCallId, setToolCallId] = useState('');
  const [output, setOutput] = useState('');
  const [stepId, setStepId] = useState<string | null>(null); // Add a new state variable for stepId

  // Define the function to handle form submission
  const handleCreateAndRunThread = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await createAndRunThread(assistantId, inputMessage);
      setThreadId(data.threadId);
      setRunId(data.runId);
      const messagesData = await listMessages(data.threadId);
      setMessages(Array.isArray(messagesData) ? messagesData : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitToolOutputs = async (event?: React.FormEvent) => {
    event?.preventDefault();
    try {
      const data = await submitToolOutputs(threadId, runId, [{ toolCallId, output }]);
      console.log('Tool outputs submitted successfully', data);
      // Set up the interval to check the run status again
      checkStatus();
    } catch (error) {
      console.error('Failed to submit tool outputs', error);
    }
  };

  // Set up an interval to check the run status every second
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (threadId && runId) {
      intervalId = setInterval(async () => {
        const statusData = await checkRunStatus(threadId, runId);
        setRunStatus(statusData.status);
        if (statusData.status === 'requires_action') {
          const toolCallId = statusData.required_action.submit_tool_outputs.tool_calls[0].id;
          setToolCallId(toolCallId);
        } else if (statusData.status === 'completed') {
          clearInterval(intervalId!);
          listMessages(threadId)
            .then(messagesData => {
              setMessages(Array.isArray(messagesData) ? messagesData : []);
              console.log('All messages:', JSON.stringify(messagesData, null, 2));
            })
            .catch(error => console.error('Failed to list messages:', error));
        }
      }, 1000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [threadId, runId]);

  // Call listRunSteps and retrieveRunStep when runStatus changes
  useEffect(() => {
    if (runStatus === 'requires_action' && threadId && runId) {
      listRunSteps(threadId, runId)
        .then(steps => {
          console.log('Run steps:', steps);
          // Assume the first step is the one we want to retrieve
          if (steps.length > 0) {
            setStepId(steps[0].id);
          }
        })
        .catch(error => console.error('Failed to list run steps:', error));
    }
  }, [runStatus, threadId, runId]);
  useEffect(() => {
    if (runStatus === 'complete' && threadId) {
      listMessages(threadId)
        .then(messagesData => {
          setMessages(Array.isArray(messagesData) ? messagesData : []);
          console.log('All messages:', messagesData);
        })
        .catch(error => console.error('Failed to list messages:', error));
    }
  }, [runStatus, threadId]);
  useEffect(() => {
    if (stepId && threadId && runId) {
      retrieveRunStep(threadId, runId, stepId)
        .then(step => console.log('Retrieved step:', step))
        .catch(error => console.error('Failed to retrieve run step:', error));
    }
  }, [stepId, threadId, runId]);

  // Render the component
  return (
    <Card>
      <CardHeader>
        <CardTitle>Run Assistant</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateAndRunThread} className="mb-4 flex gap-2">
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