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
            setters.setMessages(Array.isArray(messagesData) ? messagesData.reverse() : []);
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
  
  const handleAddMessageAndRun = async () => {
    try {
      const { inputMessage, threadId, assistantId } = state;
      const { setInputMessage } = setters;
  
      console.log('Before creating data object - Input Message:', inputMessage);
      console.log('Type of Input Message:', typeof inputMessage);
  
      // Create the data object to be sent to the addMessage function
      const data = {
        threadId: threadId,
        message: String(inputMessage)
      };
  
      console.log('After creating data object - Data:', data);
      console.log('Type of Data.message:', typeof data.message);
  
      // Call the addMessage function
      await Services.addMessage(data);
      // Add user's message to messages state
      //setters.setMessages(prevMessages => [...prevMessages, { role: 'user', content: [{ text: { value: inputMessage } }] }]);
  
      console.log('After addMessage call');
  
      // Call the runAssistant function
      await Services.runAssistant(assistantId, threadId);
  
      console.log('After runAssistant call');
  
      // Reset the inputMessage
      // Start checking run status
      checkStatusInterval();
      
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