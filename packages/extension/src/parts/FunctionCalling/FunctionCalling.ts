import { getFakeWeather } from '../FunctionCalls/FakeWeather.ts'

type FunctionCallArguments = {
  readonly callId: string
  readonly location: string
  readonly name: string
}

const createToolOutputMessage = (callId: string, output: string): string => {
  return JSON.stringify({
    item: {
      call_id: callId,
      output,
      type: 'function_call_output',
    },
    type: 'conversation.item.create',
  })
}

const createFunctionResultResponseMessage = (): string => {
  return JSON.stringify({
    type: 'response.create',
  })
}

const parseArgs = (value: unknown): Record<string, unknown> | undefined => {
  if (typeof value !== 'string') {
    return undefined
  }
  try {
    const parsed = JSON.parse(value)
    if (typeof parsed !== 'object' || parsed === null) {
      return undefined
    }
    return parsed as Record<string, unknown>
  } catch {
    return undefined
  }
}

const parseFunctionCall = (parsed: any): FunctionCallArguments | undefined => {
  if (!parsed || typeof parsed !== 'object') {
    return undefined
  }

  if (parsed.type === 'response.function_call_arguments.done') {
    const args = parseArgs(parsed.arguments)
    if (typeof parsed.call_id === 'string' && typeof parsed.name === 'string' && args && typeof args.location === 'string') {
      return {
        callId: parsed.call_id,
        location: args.location,
        name: parsed.name,
      }
    }
    return undefined
  }

  if (
    parsed.type === 'response.output_item.done' &&
    parsed.item &&
    typeof parsed.item === 'object' &&
    parsed.item.type === 'function_call' &&
    typeof parsed.item.call_id === 'string' &&
    typeof parsed.item.name === 'string' &&
    typeof parsed.item.arguments === 'string'
  ) {
    const args = parseArgs(parsed.item.arguments)
    if (args && typeof args.location === 'string') {
      return {
        callId: parsed.item.call_id,
        location: args.location,
        name: parsed.item.name,
      }
    }
  }

  return undefined
}

export const handleFunctionCall = async (
  parsed: any,
  sendToDataChannel: (data: string) => Promise<void>,
): Promise<void> => {
  const functionCall = parseFunctionCall(parsed)
  if (!functionCall || functionCall.name !== 'getweather') {
    return
  }

  const fakeWeather = getFakeWeather(functionCall.location)
  await sendToDataChannel(
    createToolOutputMessage(functionCall.callId, JSON.stringify(fakeWeather)),
  )
  await sendToDataChannel(createFunctionResultResponseMessage())
}

