"use client"

import React, { useState } from 'react';

interface AssistantDetails {
  assistantName: string;
  assistantModel: string;
  assistantDescription: string;
  fileIds: string[];
  tools: string[];
}

interface Response {
  message: string;
  assistantId: string;
}

export default function CreateAssistantPage() {
  const [assistantDetails, setAssistantDetails] = useState<AssistantDetails>({
    assistantName: 'My Assistant',
    assistantModel: 'gpt-3.5-turbo-1106',
    assistantDescription: 'This is my assistant',
    fileIds: [],
    tools: [],
  });
  const [response, setResponse] = useState<Response | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const filesArray = Array.from(event.target.files); // Convert FileList to Array
  
      for (const file of filesArray) {
        const formData = new FormData();
        formData.append('file', file);
  
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
  
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          setAssistantDetails(prevDetails => ({
            ...prevDetails,
            fileIds: [...prevDetails.fileIds, uploadData.fileId],
            tools: prevDetails.fileIds.length === 0 ? ['retrieval', ...prevDetails.tools] : prevDetails.tools,
          }));
        }
      }
    }
  };

  const handleToolChange = (tool: string) => {
    setAssistantDetails(prevDetails => ({
      ...prevDetails,
      tools: prevDetails.tools.includes(tool)
        ? prevDetails.tools.filter(t => t !== tool)
        : [...prevDetails.tools, tool],
    }));
  };

  const createAssistant = async () => {
    const res = await fetch('/api/createAssistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assistantDetails),
    });
    const data = await res.json();
    setResponse(data);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="p-5 bg-white rounded shadow-xl w-80">
        <h1 className="text-2xl font-bold mb-4">Create Assistant</h1>

        {/* File Upload */}
        <input type="file" onChange={handleFileChange} multiple />

        {/* Tools Selection */}
        <div>
          <label>
            <input
              type="checkbox"
              checked={assistantDetails.tools.includes('retrieval')}
              onChange={() => handleToolChange('retrieval')}
              disabled={assistantDetails.fileIds.length > 0}
            /> Retrieval
          </label>
          <label>
            <input
              type="checkbox"
              checked={assistantDetails.tools.includes('code_interpreter')}
              onChange={() => handleToolChange('code_interpreter')}
            /> Code Interpreter
          </label>
          <label>
            <input
              type="checkbox"
              checked={assistantDetails.tools.includes('function')}
              onChange={() => handleToolChange('function')}
            /> Function
          </label>
        </div>

        <p><strong>Name:</strong> {assistantDetails.assistantName}</p>
        <p><strong>Model:</strong> {assistantDetails.assistantModel}</p>
        <p><strong>Description:</strong> {assistantDetails.assistantDescription}</p>

        {/* Button to create the assistant */}
        <button onClick={createAssistant} className="mt-4">Create Assistant</button>

        {response && (
          <div className="mt-4">
            <h2 className="text-xl font-bold mb-2">Response</h2>
            <p><strong>Message:</strong> {response.message}</p>
            <p><strong>Assistant ID:</strong> {response.assistantId}</p>
          </div>
        )}
      </div>
    </div>
  );
}

