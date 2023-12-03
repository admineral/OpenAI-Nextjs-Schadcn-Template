"use client";

import Link from 'next/link';
import { useState,useEffect } from 'react';
import { retrieveAssistant, modifyAssistant, deleteAssistant, listAssistants } from '../services/api';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";




export default function Page() {
  const [assistantId, setAssistantId] = useState<string>('');
  const [assistantDetails, setAssistantDetails] = useState<any | null>(null);

  // New state variables for editable fields
  const [name, setName] = useState<string>('');
  const [instructions, setInstructions] = useState<string>('');

  const [assistants, setAssistants] = useState<any[]>([]);
  const [numAssistants, setNumAssistants] = useState<number>(5);


  useEffect(() => {
    // Call handleListAssistants immediately when the component mounts
    handleListAssistants();
  
    // Then call handleListAssistants every 60 seconds
    const intervalId = setInterval(handleListAssistants, 60000);
  
    // Clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);


  
  useEffect(() => {
    handleListAssistants();
  }, []);


  const handleRetrieveAssistantDetails = async () => {
    if (assistantId) {
      try {
        const data = await retrieveAssistant(assistantId);
        setAssistantDetails(data);
        setName(data.name || '');
        setInstructions(data.instructions || '');
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleSave = async () => {
    try {
      const data = await modifyAssistant({ assistantId, name, instructions });
      // Handle the response data as needed
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAssistant(id);
      console.log(`Assistant with id ${id} deleted successfully.`);
      // Refresh the list of assistants
      handleListAssistants();
    } catch (error) {
      console.error(`Error deleting assistant with id ${id}:`, error);
    }
  };

  const handleListAssistants = async () => {
    try {
      const data = await listAssistants();
      setAssistants(data.slice(-5));
    } catch (error) {
      console.error(error);
    }
  };

  
  return (
    <div className="flex flex-col items-center justify-center p-5">
      <Link href="/">
        <button className="mb-4 inline-block px-5 py-3 rounded-lg shadow-lg bg-blue-500 text-white text-lg font-bold">
          Go to Create Assistant
        </button>
      </Link>
      <select
        value={numAssistants}
        onChange={e => setNumAssistants(Number(e.target.value))}
        className="mb-5 p-2 text-lg border-2 border-gray-300 rounded-md"
      >
        {[5, 10, 15, 20, "deleteAssistant"].map(num => (
          <option key={num} value={num}>
            {num}
          </option>
        ))}
      </select>
      <button
        onClick={handleListAssistants}
        className="mb-5 p-2 text-lg bg-blue-500 text-white rounded-md"
      >
        Update
      </button>
      <input
        type="text"
        value={assistantId}
        onChange={e => setAssistantId(e.target.value)}
        placeholder="Enter assistant ID"
        className="mb-5 p-2 text-lg border-2 border-gray-300 rounded-md"
      />
      <button
        onClick={handleRetrieveAssistantDetails}
        className="mb-5 p-2 text-lg bg-blue-500 text-white rounded-md"
      >
        Retrieve Assistant Details
      </button>
      {assistantDetails && (
        <div className="flex flex-col items-start bg-gray-100 p-5 rounded-md">
          <h1 className="text-2xl mb-2">Assistant Details</h1>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Name"
            className="mb-5 p-2 text-lg border-2 border-gray-300 rounded-md"
          />
          <input
            type="text"
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            placeholder="Instructions"
            className="mb-5 p-2 text-lg border-2 border-gray-300 rounded-md"
          />
          <button
            onClick={handleSave}
            className="mb-5 p-2 text-lg bg-green-500 text-white rounded-md"
          >
            Save
          </button>
          <button
            onClick={() => handleDelete(assistantId)}
            className="mb-5 p-2 text-lg bg-red-500 text-white rounded-md"
          >
            Delete
          </button>
        </div>
      )}
      {assistants.map((assistant, index) => (
        <Table key={index}>
          <TableBody>
            <TableRow>
              <TableCell>ID: {assistant.id}</TableCell>
              <TableCell>Name: {assistant.name}</TableCell>
              <TableCell>Instructions: {assistant.instructions}</TableCell>
              <TableCell>
                <button
                  onClick={() => {
                    setAssistantId(assistant.id);
                    handleRetrieveAssistantDetails();
                  }}
                  className="p-2 text-lg bg-blue-500 text-white rounded-md mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(assistant.id)}
                  className="p-2 text-lg bg-red-500 text-white rounded-md"
                >
                  Delete
                </button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      ))}
    </div>
  );
}