# OpenAI Assistant Creation API

## Overview

This project provides an API route for creating customized OpenAI assistants. It leverages the OpenAI API to configure and create assistants based on user-defined parameters, such as the assistant's name, model, description, and optional file IDs.

## Features

- Create OpenAI assistants with customizable attributes.
- Support for various tool types (`code_interpreter`, `retrieval`, `function`).
- Ability to attach file IDs and metadata to the assistant.
- Comprehensive error handling for robust API interactions.



## Usage

Send a `POST` request to `/api/createAssistant` with the following JSON body:

```json
{
  "assistantName": "Assistant Name",
  "assistantModel": "Model ID",
  "assistantDescription": "Description",
  "fileIds": ["file-abc123"],
  "tools": [{"type": "retrieval"}],
  "metadata": {"key1": "value1"}
}
```

### Parameters

- `assistantName` (string): The name of the assistant. (Required)
- `assistantModel` (string): The model ID to use. (Required)
- `assistantDescription` (string): A brief description of the assistant. (Optional)
- `fileIds` (array): A list of file IDs to attach to the assistant. (Optional)
- `tools` (array): A list of tools enabled on the assistant. (Optional)
- `metadata` (object): Key-value pairs for additional information. (Optional)

### Response

The API returns a JSON response with the created assistant's ID:

```json
{
  "message": "Assistant created successfully",
  "assistantId": "asst_abc123"
}
```

