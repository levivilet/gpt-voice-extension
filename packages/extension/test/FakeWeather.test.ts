import { expect, test } from '@jest/globals'
import { getFakeWeather } from '../src/parts/FunctionCalls/FakeWeather.ts'

test('getFakeWeather - normalizes known location', () => {
  expect(getFakeWeather('  PARIS ')).toEqual({
    conditions: 'Sunny',
    humidity: 58,
    location: 'paris',
    temperature: 20,
    unit: 'C',
  })
})

test('getFakeWeather - returns defaults for unknown location', () => {
  expect(getFakeWeather('Berlin')).toEqual({
    conditions: 'Partly cloudy',
    humidity: 65,
    location: 'berlin',
    temperature: 21,
    unit: 'C',
  })
})

test.each([undefined, 1, null, '', ' '.repeat(3)])(
  'getFakeWeather - normalizes invalid location %#',
  (location) => {
    expect(getFakeWeather(location).location).toBe('unknown')
  },
)
