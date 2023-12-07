import { getChatCompletion as apiGetChatCompletion,createAndRunThread, listMessages, checkRunStatus, submitToolOutputs, listRunSteps, retrieveRunStep,addMessage as apiAddMessage, runAssistant as apirunAssistant } from '../services/api';

export const runAssistantCreateAndRunThread = async (assistantId: string, inputMessage: string) => {
  return await createAndRunThread(assistantId, inputMessage);
};

export const runAssistantListMessages = async (threadId: string) => {
  return await listMessages(threadId);
};

export const runAssistantCheckRunStatus = async (threadId: string, runId: string) => {
  return await checkRunStatus(threadId, runId);
};

export const runAssistantSubmitToolOutputs = async (threadId: string, runId: string, toolOutputs: Array<{ toolCallId: string; output: string; }>) => {
  return await submitToolOutputs(threadId, runId, toolOutputs);
};

export const runAssistantListRunSteps = async (threadId: string, runId: string) => {
  return await listRunSteps(threadId, runId);
};

export const runAssistantRetrieveRunStep = async (threadId: string, runId: string, stepId: string) => {
  return await retrieveRunStep(threadId, runId, stepId);
};

// Add a message to a thread
export const addMessage = async (data: { threadId: string, message: string }) => {
    console.log(typeof data.message);
    return await apiAddMessage(data);
  };
  
// Run an assistant
export const runAssistant = async (assistantId: string, threadId: string) => {
  return await apirunAssistant(assistantId, threadId);
};


// Get a chat completion
export const getChatCompletion = async (messages: Array<{ role: 'user' | 'system' | 'assistant'; content: string; }>) => {
  return await apiGetChatCompletion(messages);
};