import { expect, jest, test } from '@jest/globals'
import { handleFunctionCall } from '../src/parts/FunctionCalling/FunctionCalling.ts'

test.each([
  {
    arguments: JSON.stringify({ location: 'Paris' }),
    call_id: 'call-1',
    name: 'getweather',
    type: 'response.function_call_arguments.done',
  },
  {
    item: {
      arguments: JSON.stringify({ location: 'London' }),
      call_id: 'call-2',
      name: 'getweather',
      type: 'function_call',
    },
    type: 'response.output_item.done',
  },
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
])('handleFunctionCall - responds to supported call %#', async (event) => {
  const send = jest.fn<(data: string) => Promise<void>>(async () => undefined)

  await handleFunctionCall(event, send)

  expect(send).toHaveBeenCalledTimes(2)
  expect(JSON.parse(send.mock.calls[0][0])).toMatchObject({
    item: {
      call_id: expect.any(String),
      type: 'function_call_output',
    },
    type: 'conversation.item.create',
  })
  expect(JSON.parse(send.mock.calls[1][0])).toEqual({ type: 'response.create' })
})

test.each([
  undefined,
  null,
  'event',
  {},
  { type: 'other' },
  { arguments: 1, type: 'response.function_call_arguments.done' },
  { arguments: '{', type: 'response.function_call_arguments.done' },
  { arguments: 'null', type: 'response.function_call_arguments.done' },
  { arguments: '1', type: 'response.function_call_arguments.done' },
  {
    arguments: '{}',
    call_id: 1,
    name: 'getweather',
    type: 'response.function_call_arguments.done',
  },
  {
    arguments: '{}',
    call_id: 'call',
    name: 1,
    type: 'response.function_call_arguments.done',
  },
  {
    arguments: '{}',
    call_id: 'call',
    name: 'getweather',
    type: 'response.function_call_arguments.done',
  },
  {
    arguments: '{"location":"Paris"}',
    call_id: 'call',
    name: 'other',
    type: 'response.function_call_arguments.done',
  },
  { type: 'response.output_item.done' },
  { item: 1, type: 'response.output_item.done' },
  { item: {}, type: 'response.output_item.done' },
  { item: { type: 'other' }, type: 'response.output_item.done' },
  {
    item: {
      arguments: '{}',
      call_id: 1,
      name: 'getweather',
      type: 'function_call',
    },
    type: 'response.output_item.done',
  },
  {
    item: {
      arguments: '{}',
      call_id: 'call',
      name: 1,
      type: 'function_call',
    },
    type: 'response.output_item.done',
  },
  {
    item: {
      arguments: 1,
      call_id: 'call',
      name: 'getweather',
      type: 'function_call',
    },
    type: 'response.output_item.done',
  },
  {
    item: {
      arguments: '{}',
      call_id: 'call',
      name: 'getweather',
      type: 'function_call',
    },
    type: 'response.output_item.done',
  },
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
])('handleFunctionCall - ignores unsupported event %#', async (event) => {
  const send = jest.fn<(data: string) => Promise<void>>(async () => undefined)

  await handleFunctionCall(event, send)

  expect(send).not.toHaveBeenCalled()
})
