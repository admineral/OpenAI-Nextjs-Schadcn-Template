import React from 'react';
import RunAssistantComponent from './RunAssistantComponent';

const Page: React.FC = () => {
  const assistantId = "asst_igoqULNOpKfZVsS8QTmiJpL8"; // Hardcoded assistantId

  return (
    <div>
      <h1>My Page</h1>
      <RunAssistantComponent assistantId={assistantId} />
    </div>
  );
}

export default Page;