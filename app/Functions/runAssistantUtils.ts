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
      const data = await Services.runAssistantSubmitToolOutputs(state.threadId, state.runId, [{ toolCallId: state.toolCallId, output: state.output }]);
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
  

  return {
    handleCreateAndRunThread,
    checkStatusInterval,
    handleSubmitToolOutputs,
    checkStatus,
    listRunSteps,
    retrieveRunStep
  };
};