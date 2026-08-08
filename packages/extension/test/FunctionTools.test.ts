import { expect, test } from '@jest/globals'
import { functionTools } from '../src/parts/FunctionTools/FunctionTools.ts'

test('exposes weather and workspace file tools', () => {
  expect(functionTools.map((tool) => tool.name)).toEqual([
    'getweather',
    'read_workspace_file',
    'write_workspace_file',
  ])
  const readTool = functionTools.find(
    (tool) => tool.name === 'read_workspace_file',
  )
  const writeTool = functionTools.find(
    (tool) => tool.name === 'write_workspace_file',
  )
  expect(readTool?.parameters.required).toEqual(['path'])
  expect(writeTool?.parameters.required).toEqual(['path', 'content'])
})
