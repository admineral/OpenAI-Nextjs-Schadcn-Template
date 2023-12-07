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
          console.log('Checking run status...');
          const statusData = await Services.runAssistantCheckRunStatus(state.threadId, state.runId);
          console.log('Retrieved run status:', statusData.status);
          setters.setRunStatus(statusData.status);
          if (statusData.status === 'requires_action') {
            const toolCallId = statusData.required_action.submit_tool_outputs.tool_calls[0].id;
            console.log('Run requires action, toolCallId:', toolCallId);
            setters.setToolCallId(toolCallId);
          } else if (statusData.status === 'completed') {
            console.log('Run completed, clearing interval...');
            clearInterval(intervalId!);
            setTimeout(async () => {
              console.log('Fetching messages after 5 seconds...');
              let messagesData = await Services.runAssistantListMessages(state.threadId);
              // Check if the latest message is empty and fetch again if it is
              while (messagesData.length > 0 && messagesData[messagesData.length - 1].content[0].text.value === '') {
                console.log('Latest message is empty, fetching messages again...');
                await new Promise(r => setTimeout(r, 2000)); // wait for 2 seconds before fetching again
                messagesData = await Services.runAssistantListMessages(state.threadId);
              }
              console.log('Fetched messages:', messagesData);
              setters.setMessages(Array.isArray(messagesData) ? messagesData.reverse() : []);
              console.log('Listing run steps...');
              listRunSteps(); // Add this line
            }, 5000); // 5000 milliseconds = 5 seconds
          }
        }, 1000);
      }
      return () => {
        if (intervalId) {
          console.log('Clearing interval...');
          clearInterval(intervalId);
        }
      };
    };
    const handleSubmitToolOutputs = async (event?: React.FormEvent) => {
      event?.preventDefault();
      try {
        // Use the existing text as the tool output
        const outputMessage = state.outputMessage;
    
        console.log('Generated output:', { threadId: state.threadId, runId: state.runId, toolCallId: state.toolCallId, output: outputMessage }); // Log the generated output
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
      if ((state.runStatus === 'requires_action' || state.runStatus === 'completed') && state.threadId && state.runId) {
        const stepsData = await Services.runAssistantListRunSteps(state.threadId, state.runId);
        console.log('Run steps:', stepsData);
        // Check if stepsData.data is an array and has length greater than 0
        if (Array.isArray(stepsData.data) && stepsData.data.length > 0) {
          setters.setStepId(stepsData.data[0].id); // Assuming you want to set the first step's ID
          console.log('Before setting steps:', setters.steps);
          setters.setSteps(stepsData.data); // Set the steps state with the array
          console.log('Run steps---new:', stepsData.data); // Log the array of steps
    
          console.log('Step structure:', stepsData.data[0]); // Log the structure of the first step
          console.log('After setting steps:', setters.steps);
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
      const { setInputMessage, setMessages } = setters;
  
      // Create the data object to be sent to the addMessage function
      const data = {
        threadId: threadId,
        message: String(inputMessage)
      };
  
      console.log('Data for addMessage:', data);
  
      // Call the addMessage function
      await Services.addMessage(data);
  
      console.log('After addMessage call');
  
      // Call the runAssistant function
      await Services.runAssistant(assistantId, threadId);
  
      console.log('After runAssistant call');
  
      // Start checking run status
      checkStatusInterval();
  
      console.log('After starting checkStatusInterval');
  
      // Fetch the updated messages
      //const messagesData = await Services.runAssistantListMessages(threadId);
      //console.log('Fetched messages:', messagesData);
  
      //setMessages(Array.isArray(messagesData) ? messagesData.reverse() : []);
  
      // Reset the inputMessage
      setInputMessage('');
  
      console.log('After resetting inputMessage');
    } catch (error) {
      console.error('Error in handleAddMessageAndRun:', error);
    }
  };


  const generateWeatherText = async () => {
    try {
      // Generate a random weather prompt
      const weatherOptions = [
        'Can you provide a detailed weather report for a sunny day?',
        'Can you provide a detailed weather report for a rainy day?',
        'Can you provide a detailed weather report for a cloudy day?',
        'Can you provide a detailed weather report for a snowy day?',
        'Can you provide a detailed weather report for a windy day?'
      ];
      const randomWeatherPrompt = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
  
      // Send the random weather prompt to the chat endpoint
      const chatResponse = await Services.getChatCompletion([{ role: 'system', content: 'You are a helpful assistant.' }, { role: 'user', content: randomWeatherPrompt }]);
      console.log(chatResponse);
  
      // Check if chatResponse.reply is defined
      if (chatResponse.reply) {
        const outputMessage = chatResponse.reply;
        // Set the outputMessage state with the assistant's reply
        setters.setOutputMessage(outputMessage);
      } else {
        console.error('Chat completion API call did not return the expected data');
      }
    } catch (error) {
      console.error('Failed to generate weather text', error);
    }
  };
  return {
    handleCreateAndRunThread,
    checkStatusInterval,
    handleSubmitToolOutputs,
    checkStatus,
    listRunSteps,
    retrieveRunStep,
    handleAddMessageAndRun,
    generateWeatherText
    
  };
};