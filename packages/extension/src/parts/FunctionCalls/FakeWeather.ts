type WeatherResult = {
  readonly conditions: string
  readonly humidity: number
  readonly temperature: number
  readonly unit: 'C' | 'F'
}

const normalizeLocation = (value: unknown): string => {
  if (typeof value !== 'string') {
    return 'unknown'
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return 'unknown'
  }
  return trimmed.toLowerCase()
}

const fakeWeatherByLocation: Record<string, WeatherResult> = {
  france: {
    conditions: 'Cloudy',
    humidity: 76,
    temperature: 18,
    unit: 'C',
  },
  london: {
    conditions: 'Rain',
    humidity: 84,
    temperature: 14,
    unit: 'C',
  },
  paris: {
    conditions: 'Sunny',
    humidity: 58,
    temperature: 20,
    unit: 'C',
  },
}

export const getFakeWeather = (
  location: unknown,
): WeatherResult & { location: string } => {
  const normalizedLocation = normalizeLocation(location)
  return {
    location: normalizedLocation,
    ...(fakeWeatherByLocation[normalizedLocation] ?? {
      conditions: 'Partly cloudy',
      humidity: 65,
      temperature: 21,
      unit: 'C',
    }),
  }
}
