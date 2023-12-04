
"use client"

// Page.tsx
import { useState } from 'react';
import Link from 'next/link';
import RetrieveAssistant from './RetrieveAssistant';
import RunAssistantComponent from './RunAssistantComponent';
import { Button } from "@/components/ui";

export default function Page() {
  const [assistantId, setAssistantId] = useState('asst_igoqULNOpKfZVsS8QTmiJpL8');

  return (
    <div>
      <Link href="/">
        <Button>Go to Other Page</Button>
      </Link>
      <RetrieveAssistant setAssistantId={setAssistantId} />
      <RunAssistantComponent assistantId={assistantId} />
      {/* ...other components... */}
    </div>
  );
}


