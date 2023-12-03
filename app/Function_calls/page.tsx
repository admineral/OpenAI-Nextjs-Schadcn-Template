"use client"

import { useEffect,useState } from 'react';
import { retrieveAssistant, createAndRunThread, listMessages } from '../services/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Button,
  Input,
} from "@/components/ui";


export default function Page() {
  const [assistantId, setAssistantId] = useState('');
  const [assistantDetails, setAssistantDetails] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const [threadId, setThreadId] = useState(null);
  const [runId, setRunId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState([]);
  const [toolCallId, setToolCallId] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('');
  const [toolCallResponse, setToolCallResponse] = useState('');

 




  const handleRetrieveAssistant = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await retrieveAssistant(assistantId);
      setAssistantDetails(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAndRunThread = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await createAndRunThread(assistantId, inputMessage);
      setThreadId(data.threadId);
      setRunId(data.runId);
      const messagesData = await listMessages(data.threadId, data.runId);
      setMessages(Array.isArray(messagesData) ? messagesData : []);    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
    // New function to handle tool output submission
    const handleSubmitToolOutputs = async (event) => {
      event.preventDefault();
      setLoading(true);
      try {
        await submitToolOutputs(threadId, runId, [{ toolCallId, output: toolCallResponse }]);
        const messagesData = await listMessages(threadId, runId);
        setMessages(Array.isArray(messagesData) ? messagesData : []);
        setStatus('completed');
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

      // New useEffect hook to fetch status
  useEffect(() => {
    const fetchStatus = async () => {
      // Replace with your actual API call to fetch status
      const statusData = await fetchStatusAPI(threadId, runId);
      setStatus(statusData.status);
    };

    fetchStatus();
  }, [threadId, runId]);


  return (
    <div className="p-4">
      <form onSubmit={handleRetrieveAssistant} className="mb-4 flex gap-2">
        <Input
          value={assistantId}
          onChange={(e) => setAssistantId(e.target.value)}
          placeholder="Enter assistant ID"
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Retrieve Assistant'}
        </Button>
      </form>
  
      {assistantDetails && (
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button>View Assistant Details</Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-96">
            <Card>
              <CardHeader>
                <CardTitle>{assistantDetails.name}</CardTitle>
                <CardDescription>ID: {assistantDetails.id}</CardDescription>
              </CardHeader>
              <CardContent>
                <p><strong>Model:</strong> {assistantDetails.model}</p>
                <p><strong>Instructions:</strong> {assistantDetails.instructions}</p>
                <p><strong>Created At:</strong> {new Date(assistantDetails.created_at * 1000).toLocaleString()}</p>
                <p><strong>Description:</strong> {assistantDetails.description || 'N/A'}</p>
                {assistantDetails.tools && assistantDetails.tools.map((tool, index) => (
                  <div key={index} className="p-4 border rounded mt-4">
                    <p><strong>Type:</strong> {tool.type}</p>
                    <p><strong>Function Name:</strong> {tool.function.name}</p>
                    <p><strong>Function Description:</strong> {tool.function.description}</p>
                    <p><strong>Function Parameters:</strong></p>
                    {Object.entries(tool.function.parameters.properties).map(([key, value]) => (
                      <p key={key}><strong>{key}:</strong> {value.description} ({value.type})</p>
                    ))}
                  </div>
                ))}
                <p><strong>File IDs:</strong> {assistantDetails.file_ids.join(', ')}</p>
                <pre><strong>Metadata:</strong> {JSON.stringify(assistantDetails.metadata, null, 2)}</pre>
              </CardContent>
              <CardFooter>
                <p>End of Assistant Details</p>
              </CardFooter>
            </Card>
          </HoverCardContent>
        </HoverCard>
      )}
  
      <form onSubmit={handleCreateAndRunThread} className="mb-4 flex gap-2">
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Enter a message"
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Running...' : 'Run'}
        </Button>
      </form>
  
      {messages.map((message, index) => (
  <Card key={index} className="mb-4">
    <CardHeader>
      <CardTitle>Message {index + 1}</CardTitle>
    </CardHeader>
    <CardContent>
      <p><strong>Role:</strong> {message.role}</p>
      <p><strong>Content:</strong> {message.content}</p>
    </CardContent>
  </Card>
))}
    </div>
  );
}