"use client"

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button, Input, Checkbox, Card, Form,FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@shadcn/ui';

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

const formSchema = z.object({
  assistantName: z.string(),
  assistantModel: z.string(),
  assistantDescription: z.string(),
  fileIds: z.array(z.string()),
  tools: z.array(z.string()),
  file: z.any(), // Add this line
});

export default function CreateAssistantPage() {
  const [assistantDetails, setAssistantDetails] = useState<AssistantDetails>({
    assistantName: 'My Assistant',
    assistantModel: 'gpt-3.5-turbo-1106',
    assistantDescription: 'This is my assistant',
    fileIds: [],
    tools: [],
  });
  const [response, setResponse] = useState<Response | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: assistantDetails,
  });

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
  
          // Update the form value
          form.setValue('file', uploadData.fileId);
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

  const createAssistant = async (values: z.infer<typeof formSchema>) => {
    const res = await fetch('/api/createAssistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    setResponse(data);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Card className="p-5 w-80">
        <h1 className="text-2xl font-bold mb-4">Create Assistant</h1>
  
        <Form {...form}>
          <form onSubmit={form.handleSubmit(createAssistant)} className="space-y-8">
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File Upload</FormLabel>
                  <FormControl>
                    <Input type="file" {...field} multiple onChange={handleFileChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
  
            <FormField
              control={form.control}
              name="tools"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tools Selection</FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={assistantDetails.tools.includes('retrieval')}
                      onChange={() => handleToolChange('retrieval')}
                      disabled={assistantDetails.fileIds.length > 0}
                    > Retrieval</Checkbox>
                    <Checkbox
                      checked={assistantDetails.tools.includes('code_interpreter')}
                      onChange={() => handleToolChange('code_interpreter')}
                    > Code Interpreter</Checkbox>
                    <Checkbox
                      checked={assistantDetails.tools.includes('function')}
                      onChange={() => handleToolChange('function')}
                    > Function</Checkbox>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
  <FormField
  control={form.control}
  name="assistantName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Assistant Name</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="assistantModel"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Assistant Model</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="assistantDescription"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Assistant Description</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
            {/* Add other FormFields here */}
  
            <Button type="submit">Create Assistant</Button>
          </form>
        </Form>
  
        {response && (
          <div className="mt-4">
            <h2 className="text-xl font-bold mb-2">Response</h2>
            <p><strong>Message:</strong> {response.message}</p>
            <p><strong>Assistant ID:</strong> {response.assistantId}</p>
          </div>
        )}
      </Card>
    </div>
  );
}