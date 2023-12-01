// api.ts

// Define the type for the response of the deleteFile function
interface DeletionResponse {
  success: boolean;
  message?: string;
}

// Define the options type for the listAssistants function
interface ListAssistantsOptions {
  limit?: number;
  order?: 'asc' | 'desc';
  after?: string;
  before?: string;
}

// Define the type for the assistant details
interface AssistantDetails {
  assistantId: string;
  name: string;
  instructions: string;
}

// Define the type for the message data
interface MessageData {
  // Define the properties of the message data here
  // For example:
  text: string;
  // Add more properties as needed
}


// Uploads a base64 encoded image and gets a description
export const uploadImageAndGetDescription = async (base64Image: string) => {
    console.log('Uploading image...');
    const response = await fetch('/api/upload_gpt4v', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: base64Image }),
    });
    if (!response.ok) {
      console.error('Error processing image');
      throw new Error('Error processing image');
    }
    console.log('Image uploaded successfully');
    return await response.json();
  };
  
  // Uploads a file
  export const uploadFile = async (file: File) => {
    console.log('Uploading file...');
    const fileData = new FormData();
    fileData.append('file', file);
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: fileData,
    });
    if (!response.ok) {
      console.error('File upload failed');
      throw new Error('File upload failed');
    }
    console.log('File uploaded successfully');
    return await response.json();
  };

// my-app/app/services/api.ts
// Deletes a file
export const deleteFile = async (fileId: string) => {
  console.log(`Deleting file with ID: ${fileId}...`);
  const response = await fetch(`/api/deleteFile`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileId }),
  });
  if (!response.ok) {
    console.error('File deletion failed with status:', response.status);
    throw new Error('File deletion failed');
  }
  const jsonResponse = await response.json();
  console.log('Server response:', jsonResponse);
  console.log('File deleted successfully');
  return jsonResponse.deleted;
};
  
  // Creates an assistant
  export const createAssistant = async (assistantName: string, assistantModel: string, assistantDescription: string, fileId: string) => {
    console.log('Creating assistant...');
    const response = await fetch('/api/createAssistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assistantName, assistantModel, assistantDescription, fileId }),
    });
    if (!response.ok) {
      console.error('Failed to create assistant');
      throw new Error('Failed to create assistant');
    }
    console.log('Assistant created successfully');
    return await response.json();
  };
  
  // Creates a thread
  export const createThread = async (inputmessage: string) => {
    console.log('Creating thread...');
    const response = await fetch('/api/createThread', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputmessage }),
    });
    if (!response.ok) {
      console.error('Failed to create thread');
      throw new Error('Failed to create thread');
    }
    console.log('Thread created successfully');
    return await response.json();
  };
  
  // Runs an assistant
  export const runAssistant = async (assistantId: string, threadId: string) => {
    console.log('Running assistant...');
    const response = await fetch('/api/runAssistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assistantId, threadId }),
    });
    if (!response.ok) {
      console.error('Failed to run assistant');
      throw new Error('Failed to run assistant');
    }
    const data = await response.json();
    console.log('Assistant run successfully. Run ID:', data.runId);
    return data;
  };
  
  // Checks the status of a run
  export const checkRunStatus = async (threadId: string, runId: string) => {
    console.log('Checking run status...');
    const response = await fetch('/api/checkRunStatus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId, runId }),
    });
    if (!response.ok) {
      console.error('Failed to check run status');
      throw new Error('Failed to check run status');
    }
    console.log('Run status checked successfully');
    return await response.json();
  };
  
  // Lists messages
  export const listMessages = async (threadId: string, runId: string) => {
    console.log('Listing messages...');
    const response = await fetch('/api/listMessages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId, runId }),
    });
    if (!response.ok) {
      console.error(`Error fetching messages: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to list messages: ${response.status} ${response.statusText}`);
    }
    const jsonResponse = await response.json();
    console.log('Messages listed successfully');
    return jsonResponse;
  };
  
  // Adds a message
  export const addMessage = async (data: any) => {
    console.log('Adding message...');
    const response = await fetch('/api/addMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      console.error('Failed to add message');
      throw new Error('Failed to add message');
    }
    console.log('Message added successfully');
    return await response.json();
  };


// app/services/api.ts

// Retrieves an assistant
export const retrieveAssistant = async (assistantId: string) => {
  console.log('Retrieving assistant...');
  const response = await fetch('/api/retrieveAssistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assistantId }),
  });
  if (!response.ok) {
    console.error('Failed to retrieve assistant');
    throw new Error('Failed to retrieve assistant');
  }
  const data = await response.json();
  console.log('Assistant retrieved successfully. Assistant details:', data);
  return data;
};

// Modifies an assistant
export const modifyAssistant = async (assistantDetails: any) => {
  console.log('Modifying assistant...');
  const response = await fetch('/api/modifyAssistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(assistantDetails),
  });
  if (!response.ok) {
    console.error('Failed to modify assistant');
    throw new Error('Failed to modify assistant');
  }
  const data = await response.json();
  console.log('Assistant modified successfully. Updated assistant details:', data);
  return data;
};

// app/services/api.ts

// Deletes an assistant
export const deleteAssistant = async (assistantId: string) => {
  console.log('Deleting assistant...');
  const response = await fetch('/api/deleteAssistant', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assistantId }),
  });
  if (!response.ok) {
    console.error('Failed to delete assistant');
    throw new Error('Failed to delete assistant');
  }
  const data = await response.json();
  console.log('Assistant deleted successfully. Response:', data);
  return data;
};


// app/services/api.ts

// app/services/api.ts

// Modify the listAssistants function to use POST and send an options object
// app/services/api.ts

export async function listAssistants(options: { limit?: number, order?: string, after?: string, before?: string } = {}) {
  try {
    const response = await fetch('/api/listAssistants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error('Failed to list assistants');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}