"use client"

import { useState } from 'react';
import { retrieveAssistant } from '../services/api';
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

interface AssistantDetails {
  name: string;
  id: string;
  model: string;
  instructions: string;
  created_at: number;
  description: string;
  tools: Array<any>; // Replace with the actual type of the tools
  file_ids: Array<string>;
  metadata: any; // Replace with the actual type of the metadata
}

export default function RetrieveAssistant() {
  const [assistantId, setAssistantId] = useState<string>('asst_igoqULNOpKfZVsS8QTmiJpL8');
  const [assistantDetails, setAssistantDetails] = useState<AssistantDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleRetrieveAssistant = async (event: React.FormEvent) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Retrieve Assistant</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}