export interface FunctionToolDefinition {
  readonly description: string
  readonly name: string
  readonly parameters: Readonly<Record<string, unknown>>
  readonly type: 'function'
}

const getWeatherTool: FunctionToolDefinition = {
  description: 'Get weather for a location.',
  name: 'getweather',
  parameters: {
    additionalProperties: false,
    properties: {
      location: {
        description: 'Location to get the weather for',
        type: 'string',
      },
    },
    required: ['location'],
    type: 'object',
  },
  type: 'function',
}

const readWorkspaceFileTool: FunctionToolDefinition = {
  description:
    'Read a UTF-8 text file from the currently opened workspace. The path must be relative to the workspace folder.',
  name: 'read_workspace_file',
  parameters: {
    additionalProperties: false,
    properties: {
      path: {
        description: 'File path relative to the currently opened workspace',
        type: 'string',
      },
    },
    required: ['path'],
    type: 'object',
  },
  type: 'function',
}

const writeWorkspaceFileTool: FunctionToolDefinition = {
  description:
    'Write UTF-8 text to a file in the currently opened workspace. The path must be relative to the workspace folder.',
  name: 'write_workspace_file',
  parameters: {
    additionalProperties: false,
    properties: {
      content: {
        description: 'Complete UTF-8 text content to write',
        type: 'string',
      },
      path: {
        description: 'File path relative to the currently opened workspace',
        type: 'string',
      },
    },
    required: ['path', 'content'],
    type: 'object',
  },
  type: 'function',
}

export const functionTools: readonly FunctionToolDefinition[] = [
  getWeatherTool,
  readWorkspaceFileTool,
  writeWorkspaceFileTool,
]
