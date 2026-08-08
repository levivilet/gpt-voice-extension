import { expect, test } from '@jest/globals'
import { getFakeWeather } from '../src/parts/FakeWeather/FakeWeather.ts'

test('returns weather for a registered location', () => {
  expect(getFakeWeather(' Paris ')).toEqual({
    conditions: 'Sunny',
    humidity: 58,
    location: 'paris',
    temperature: 20,
    unit: 'C',
  })
})

test('returns default weather for an unregistered location', () => {
  expect(getFakeWeather('Berlin')).toEqual({
    conditions: 'Partly cloudy',
    humidity: 65,
    location: 'berlin',
    temperature: 21,
    unit: 'C',
  })
})

test('normalizes empty and non-string locations', () => {
  expect(getFakeWeather('  ').location).toBe('unknown')
  expect(getFakeWeather(undefined).location).toBe('unknown')
})
