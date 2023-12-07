"use client"
import React, { useState } from 'react';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import  {CardHeader, CardContent, CardFooter,Textarea,Select, SelectContent, SelectItem, SelectTrigger, SelectValue,Button, Input, Checkbox, Card, Form,FormControl, FormField, FormItem, FormLabel, FormMessage, Switch } from '@shadcn/ui';
import UploadFiles_Configure from './UploadFiles_Configure';



import Link from 'next/link';

interface FileData {
  name: string;
  fileId?: string;
  status?: 'uploading' | 'uploaded' | 'failed';
}
interface UploadFilesProps {
  files: FileData[];
  setFiles: React.Dispatch<React.SetStateAction<FileData[]>>;
  onFileIdUpdate: (fileId: string) => void; // Add this line
}





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
  const [activeFileIds, setActiveFileIds] = useState<string[]>([]);

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


  const createAssistant = async (values: z.infer<typeof formSchema>, e: any) => {
    e.preventDefault(); // Prevent the default form submission event
  
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



  const handleFileIdUpdate = (fileId: string) => {
    setAssistantDetails(prevDetails => {
      const newDetails = {
        ...prevDetails,
        fileIds: [...prevDetails.fileIds, fileId],
      };
      return newDetails;
    });
    setActiveFileIds((prevFileIds) => [...prevFileIds, fileId]);
  };

  //Return the page
  return (

    <div className="flex flex-col items-center justify-center min-h-screen py-2">
          <Link href="/Assistants">
            <button className="mb-4 inline-block px-5 py-3 rounded-lg shadow-lg bg-blue-500 text-white text-lg font-bold">
              Go to Assistants
            </button>
          </Link>
          <Link href="/Functions">
            <button className="mb-4 inline-block px-5 py-3 rounded-lg shadow-lg bg-blue-500 text-white text-lg font-bold">
              Go to Function Beta
            </button>
          </Link>
          <Link href="/Function_calls">
            <button className="mb-4 inline-block px-5 py-3 rounded-lg shadow-lg bg-blue-500 text-white text-lg font-bold">
              Go to Function Alpha
            </button>
          </Link>
      <Card className="p-5 w-1/2">
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

<UploadFiles_Configure files={files} setFiles={setFiles} onFileIdUpdate={handleFileIdUpdate} setActiveFileIds={setActiveFileIds} />




  
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