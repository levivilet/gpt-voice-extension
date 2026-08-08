import { expect, test } from '@jest/globals'
import { executeFunctionToolCall } from '../src/parts/FunctionCalling/FunctionCalling.ts'

test('executes completed function call arguments and creates response messages', () => {
  const result = executeFunctionToolCall({
    arguments: '{"location":"Paris"}',
    call_id: 'call-1',
    name: 'getweather',
    type: 'response.function_call_arguments.done',
  })

  expect(result).toHaveLength(2)
  const outputMessage = JSON.parse(result[0] || '{}')
  expect(outputMessage).toEqual({
    item: {
      call_id: 'call-1',
      output: expect.any(String),
      type: 'function_call_output',
    },
    type: 'conversation.item.create',
  })
  expect(JSON.parse(outputMessage.item.output)).toEqual({
    conditions: 'Sunny',
    humidity: 58,
    location: 'paris',
    temperature: 20,
    unit: 'C',
  })
  expect(result[1]).toBe(JSON.stringify({ type: 'response.create' }))
})

test('executes completed function call output items', () => {
  const result = executeFunctionToolCall({
    item: {
      arguments: '{"location":"London"}',
      call_id: 'call-2',
      name: 'getweather',
      type: 'function_call',
    },
    type: 'response.output_item.done',
  })

  expect(result).toHaveLength(2)
  expect(result[0]).toContain('call-2')
  expect(result[0]).toContain('london')
})

test.each([
  undefined,
  null,
  'value',
  {},
  { type: 'response.function_call_arguments.done' },
  { item: {}, type: 'response.output_item.done' },
])('ignores events without a completed function call', (event: unknown) => {
  expect(executeFunctionToolCall(event)).toEqual([])
})

test('rejects calls for unknown tools', () => {
  expect(() =>
    executeFunctionToolCall({
      arguments: '{}',
      call_id: 'call-3',
      name: 'unknown',
      type: 'response.function_call_arguments.done',
    }),
  ).toThrow('Unknown function tool: unknown')
})
