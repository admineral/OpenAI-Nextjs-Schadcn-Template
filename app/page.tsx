"use client"

import React, { useState } from 'react';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,Button, Input, Checkbox, Card, Form,FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@shadcn/ui';

interface AssistantDetails {
  assistantName: string;
  assistantModel: string;
  assistantDescription: string;
  fileIds: string[];
  tools: ("function" | "retrieval" | "code_interpreter")[]; // Change this line
}

const tools = [
  {
    id: 'retrieval',
    label: 'Retrieval',
  },
  {
    id: 'code_interpreter',
    label: 'Code Interpreter',
  },
  {
    id: 'function',
    label: 'Function',
  },
];

interface Response {
  message: string;
  assistantId: string;
}

const formSchema = z.object({
  assistantName: z.string(),
  assistantModel: z.string(),
  assistantDescription: z.string(),
  fileIds: z.array(z.string()),
  tools: z.array(z.enum(['retrieval', 'code_interpreter', 'function'])),
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
        // Nach dem Hochladen einer Datei
        if (uploadData.success) {
          setAssistantDetails(prevDetails => {
            const newDetails = {
              ...prevDetails,
              fileIds: [...prevDetails.fileIds, uploadData.fileId],
              tools: prevDetails.tools.includes('retrieval') ? prevDetails.tools : ['retrieval', ...prevDetails.tools] as ("function" | "retrieval" | "code_interpreter")[],
            };
            console.log('Updated assistantDetails:', newDetails);
            return newDetails;
          });
        
          // Update the form value
          form.setValue('file', uploadData.fileId);
        }
      }
    }
  };

  const handleToolChange = (tool: "function" | "retrieval" | "code_interpreter") => {
    setAssistantDetails(prevDetails => ({
      ...prevDetails,
      tools: prevDetails.tools.includes(tool)
        ? prevDetails.tools.filter(t => t !== tool)
        : [...prevDetails.tools, tool],
    }));
  };

  // Vor dem Senden der Anforderung an den Server
  const createAssistant = async (values: z.infer<typeof formSchema>) => {
    console.log('Sending request with assistantDetails:', assistantDetails);
    const res = await fetch('/api/createAssistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...values,
        fileIds: assistantDetails.fileIds, // Include the fileIds
        tools: assistantDetails.tools, // Include the tools
      }),
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
  
  <Controller
  control={form.control}
  name="assistantModel"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Assistant Model</FormLabel>
      <FormControl>
        <Select onValueChange={field.onChange} value={field.value}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-3.5-turbo-1106">GPT-3.5</SelectItem>
            <SelectItem value="gpt-4-1106-preview">GPT-4</SelectItem>
            {/* Add other models here */}
          </SelectContent>
        </Select>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

<Controller
  control={form.control}
  name="file"
  render={({ field: { onChange, ref } }) => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <FormLabel htmlFor="picture">Picture</FormLabel>
      <Input id="picture" type="file" ref={ref} onChange={event => {
        if (event.target.files) {
          handleFileChange(event);
          onChange(event.target.files[0]); // Update the form value
        }
      }} />
    </div>
  )}
/>
<FormField
  control={form.control}
  name="tools"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Tools</FormLabel>
      {tools.map((tool) => (
        <div key={tool.id}>
          <Checkbox
            checked={field.value?.includes(tool.id as "function" | "retrieval" | "code_interpreter")}
            onCheckedChange={(checked) => {
              return checked
                ? field.onChange([...(field.value || []), tool.id as "function" | "retrieval" | "code_interpreter"])
                : field.onChange(
                    (field.value || []).filter(
                      (value) => value !== tool.id
                    )
                  );
            }}
          />
          <span>{tool.label}</span>
        </div>
      ))}
      <FormMessage />
    </FormItem>
  )}
/>
  
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