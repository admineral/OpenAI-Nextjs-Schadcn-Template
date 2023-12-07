import * as Services from './runAssistantServices';

export const useRunAssistantUtilities = (state, setters) => {
    const handleCreateAndRunThread = async (event: React.FormEvent) => {
      event.preventDefault();
      setters.setLoading(true);
      try {
        const data = await Services.runAssistantCreateAndRunThread(state.assistantId, state.inputMessage);
        setters.setThreadId(data.threadId);
        setters.setRunId(data.runId);
        setters.setLoading(false);
        const messagesData = await Services.runAssistantListMessages(data.threadId);
        setters.setMessages(Array.isArray(messagesData) ? messagesData : []);
        checkStatusInterval(); // Add this line
      } catch (error) {
        console.error(error);
        setters.setLoading(false);
      }
    };

    const checkStatusInterval = () => {
      let intervalId: NodeJS.Timeout | null = null;
      if (state.threadId && state.runId) {
        intervalId = setInterval(async () => {
          const statusData = await Services.runAssistantCheckRunStatus(state.threadId, state.runId);
          setters.setRunStatus(statusData.status);
          if (statusData.status === 'requires_action') {
            const toolCallId = statusData.required_action.submit_tool_outputs.tool_calls[0].id;
            setters.setToolCallId(toolCallId);
          } else if (statusData.status === 'completed') {
            clearInterval(intervalId!);
            const messagesData = await Services.runAssistantListMessages(state.threadId);
            setters.setMessages(Array.isArray(messagesData) ? messagesData : []);
            listRunSteps(); // Add this line
          }
        }, 1000);
      }
      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    };

    const handleSubmitToolOutputs = async (event?: React.FormEvent) => {
      event?.preventDefault();
      try {
        const outputMessage = state.outputMessage;
        console.log('Input received:', { threadId: state.threadId, runId: state.runId, toolCallId: state.toolCallId, output: outputMessage }); // Log the input
        const data = await Services.runAssistantSubmitToolOutputs(state.threadId, state.runId, [{ toolCallId: state.toolCallId, output: outputMessage }]);
        console.log('Output sent:', data); // Log the output
        console.log('Tool outputs submitted successfully', data);
        checkStatus();
      } catch (error) {
        console.error('Failed to submit tool outputs', error);
      }
    };

    const checkStatus = async () => {
      if (state.threadId && state.runId) {
        const statusData = await Services.runAssistantCheckRunStatus(state.threadId, state.runId);
        setters.setRunStatus(statusData.status); // Updated
        if (statusData.status === 'requires_action') {
          const toolCallId = statusData.required_action.submit_tool_outputs.tool_calls[0].id;
          setters.setToolCallId(toolCallId); // Updated
        } else if (statusData.status === 'completed') {
          const messagesData = await Services.runAssistantListMessages(state.threadId);
          setters.setMessages(Array.isArray(messagesData) ? messagesData : []); // Updated
        }
      }
    };
  
  const listRunSteps = async () => {
    if (state.runStatus === 'requires_action' && state.threadId && state.runId) {
      const steps = await Services.runAssistantListRunSteps(state.threadId, state.runId);
      console.log('Run steps:', steps);
      if (steps.length > 0) {
        setters.setStepId(steps[0].id); // Updated
      }
    }
  };

  const retrieveRunStep = async () => {
    if (state.stepId && state.threadId && state.runId) {
      const step = await Services.runAssistantRetrieveRunStep(state.threadId, state.runId, state.stepId);
      console.log('Retrieved step:', step);
    }
  };
  
    // Inside useRunAssistantUtilities hook
  const handleAddMessageAndRun = async () => {
    try {
      // Add the message
      const messageData = await Services.addMessage({
        threadId: state.threadId,
        message: state.inputMessage
      });

      // Run the assistant
      const runData = await Services.runAssistant(state.assistantId, state.threadId);

      // Update the state with the new message and run data
      setMessages(prevMessages => [...prevMessages, messageData]);
      setRunId(runData.id);
      
      setInputMessage('');
    } catch (error) {
      console.error(error);
    }
  };

  return {
    handleCreateAndRunThread,
    checkStatusInterval,
    handleSubmitToolOutputs,
    checkStatus,
    listRunSteps,
    retrieveRunStep,
    handleAddMessageAndRun
  };
};