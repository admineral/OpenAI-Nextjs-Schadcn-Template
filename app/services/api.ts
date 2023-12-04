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
  
  export const createAssistant = async (
    assistantName: string,
    assistantModel: string,
    assistantDescription: string,
    fileIds?: string[],
    tools?: ({ toolName: string; config: any })[]
  ) => {
    console.log('Creating assistant...');
    const requestBody: any = {
      assistantName,
      assistantModel,
      assistantDescription,
      ...(tools ? { tools } : {}),
    };
    if (fileIds && fileIds.length > 0) {
      requestBody.fileIds = fileIds;
    }
    const response = await fetch('/api/createAssistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
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
  
  // app/services/api.ts
  export const listMessages = async (threadId: string) => {
    console.log('Listing messages...');
    const response = await fetch('/api/listMessages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId }),
    });

    if (!response.ok) {
      console.error('Error listing messages:', response.statusText);
      throw new Error('Failed to list messages');
    }

    const jsonResponse = await response.json();
    console.log('Messages listed successfully');
    return jsonResponse.messages;
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






// achtung beta


// Create and Run Thread
export const createAndRunThread = async (assistantId: string, inputMessage: string) => {
  console.log('Creating and running thread...');
  const requestBody = {
    assistantId,
    thread: {
      messages: [
        {
          role: "user",
          content: inputMessage
        }
      ]
    }
  };
  const response = await fetch('/api/createThreadAndRun', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });
  if (!response.ok) {
    console.error('Failed to create and run thread');
    throw new Error('Failed to create and run thread');
  }
  const data = await response.json();
  console.log('Thread created and run successfully');
  return { threadId: data.thread_id, runId: data.id };
};

// List Run Steps
export const listRunSteps = async (threadId: string, runId: string, options: any = {}) => {
  console.log('Listing run steps...');
  const response = await fetch('/api/listRunSteps', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ threadId, runId, ...options }),
  });

  // Log the response status
  console.log('Response status:', response.status);

  // Try to parse the response body as JSON and log it
  let responseBody;
  try {
    responseBody = await response.json();
    console.log('Response body:', responseBody);
  } catch (error) {
    console.error('Failed to parse response body:', error);
  }
  
  if (!response.ok) {
    console.error('Failed to list run steps');
    throw new Error('Failed to list run steps');
  }
  console.log('Run steps listed successfully');
  return responseBody;
};

// Retrieve Run Step
export const retrieveRunStep = async (threadId: string, runId: string, stepId: string) => {
  console.log('Retrieving run step...');
  const response = await fetch('/api/retrieveRunStep', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ threadId, runId, stepId }),
  });
  if (!response.ok) {
    console.error('Failed to retrieve run step');
    throw new Error('Failed to retrieve run step');
  }
  console.log('Run step retrieved successfully');
  return await response.json();
};

// Submit Tool Outputs
// app/services/api.ts

// Submit Tool Outputs
export const submitToolOutputs = async (threadId: string, runId: string, toolOutputs: { toolCallId: string, output: string }[]) => {
  console.log('Submitting tool outputs...');
  const response = await fetch('/api/submitToolOutputs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ threadId, runId, toolOutputs }),
  });
  if (!response.ok) {
    console.error('Failed to submit tool outputs');
    throw new Error('Failed to submit tool outputs');
  }
  console.log('Tool outputs submitted successfully');
  return await response.json();
};

// Cancel a Run
export const cancelRun = async (threadId: string, runId: string) => {
  console.log('Cancelling run...');
  const response = await fetch('/api/cancelRun', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ threadId, runId }),
  });
  if (!response.ok) {
    console.error('Failed to cancel run');
    throw new Error('Failed to cancel run');
  }
  console.log('Run cancelled successfully');
  return await response.json();
};