"use client"

import React, { useState } from 'react';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import  {CardHeader, CardContent, CardFooter,Textarea,Select, SelectContent, SelectItem, SelectTrigger, SelectValue,Button, Input, Checkbox, Card, Form,FormControl, FormField, FormItem, FormLabel, FormMessage, Switch } from '@shadcn/ui';
import UploadFiles_Configure from './UploadFiles_Configure';


import Link from 'next/link';



interface AssistantDetails {
  assistantName: string;
  assistantModel: string;
  assistantDescription: string;
  fileIds: string[];
  tools: ("function" | "retrieval" | "code_interpreter")[]; 
}

const tools: { id: "function" | "retrieval" | "code_interpreter"; label: string; }[] = [

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
  file: z.any(),
});




export default function CreateAssistantPage() {

  const [response, setResponse] = useState<Response | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<FileData[]>([]);

  const [assistantDetails, setAssistantDetails] = useState<AssistantDetails>({
    assistantName: '',
    assistantModel: 'gpt-3.5-turbo-1106',
    assistantDescription: '',
    fileIds: [],
    tools: [],
  });



  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: assistantDetails,
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {

    if (event.target.files && event.target.files.length > 0) {

      setIsUploading(true);

      const filesArray = Array.from(event.target.files); 
  
      for (const file of filesArray) {
        const formData = new FormData();
        formData.append('file', file);
  
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
  
        const uploadData = await uploadRes.json();

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
        }
      }
      setIsUploading(false);
    }
  };

  const handleToolChange = (tool: "function" | "retrieval" | "code_interpreter", checked: boolean) => {
    setAssistantDetails(prevDetails => {
      const newTools = prevDetails.tools.filter(t => t !== tool);
      if (checked) {
        newTools.push(tool);
      }
      return {
        ...prevDetails,
        tools: newTools,
      };
    });
  };

  const createAssistant = async (values: z.infer<typeof formSchema>) => {
    console.log('Sending request with assistantDetails:', assistantDetails);
    const res = await fetch('/api/createAssistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...values,
        fileIds: assistantDetails.fileIds, 
        tools: assistantDetails.tools, 
      }),
    });
    const data = await res.json();
    setResponse(data);
  };


  //Return the page
  return (

    <div className="flex flex-col items-center justify-center min-h-screen py-2">
          <Link href="/Assistants">
            <button className="mb-4 inline-block px-5 py-3 rounded-lg shadow-lg bg-blue-500 text-white text-lg font-bold">
              Go to Assistants
            </button>
          </Link>
      <Card className="p-5 w-600">
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
                    <Input {...field} placeholder="Enter assistant name" />
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
                <Textarea {...field} className="resize-y w-full !important" placeholder="Describe the assistant" />
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
                  <Input id="fileInput" type="file" multiple ref={ref} onChange={event => {
                    if (event.target.files) {
                      handleFileChange(event);
                      onChange(event.target.files[0]); 
                    }
                  }} />
                </div>
              )}
            />





<UploadFiles_Configure files={files} setFiles={setFiles} />


<FormField
  control={form.control}
  name="tools"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Tools</FormLabel>
      {tools.map((tool) => (
        <div key={tool.id} className="flex items-center justify-between py-2">
          <span>{tool.label}</span>
          <Switch
  checked={field.value?.includes(tool.id)}
  disabled={tool.id === 'function'}
  onCheckedChange={(checked) => {
    // Direkter Aufruf mit `tool.id`, da es bereits den korrekten Typ hat
    handleToolChange(tool.id, checked);
    const updatedTools = checked
      ? [...(field.value || []), tool.id]
      : (field.value || []).filter((value) => value !== tool.id);
    field.onChange(updatedTools);
  }}
/>
        </div>
      ))}
    </FormItem>
  )}
/>


  
  <Button type="submit" disabled={isUploading}>
  {isUploading ? 'Uploading...' : 'Create Assistant'}
</Button>        </form>
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