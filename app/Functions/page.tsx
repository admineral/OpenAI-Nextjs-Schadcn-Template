"use client"

import React from 'react';
import RunAssistantComponent from './RunAssistantComponent';
import Link from 'next/link';
import { Button } from "@/components/ui";

const Page: React.FC = () => {
  const assistantId = "asst_igoqULNOpKfZVsS8QTmiJpL8"; // Hardcoded assistantId

  return (
    <div>
              <Link href="/">
        <Button>Go to Other Page</Button>
      </Link>
      <h1>My Page</h1>
      <RunAssistantComponent assistantId={assistantId} />
    </div>
  );
}

export default Page;