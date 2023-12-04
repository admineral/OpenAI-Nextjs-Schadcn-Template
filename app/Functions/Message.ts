// Message.ts

export interface Message {
    id: string;
    role: string;
    content: Array<{ type: string, text: string | { value: string, annotations: any } }>;
  }