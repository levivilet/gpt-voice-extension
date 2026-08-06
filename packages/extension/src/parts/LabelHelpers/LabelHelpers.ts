import type { gpt-voiceLabel } from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'

export const getLabelText = (label: Readonly<gpt-voiceLabel>): string => {
  return label.name?.trim() || label.color?.trim() || gpt-voiceStrings.label()
}

export const labelColors = [
  'green_light',
  'yellow_light',
  'orange_light',
  'red_light',
  'purple_light',
  'green',
  'yellow',
  'orange',
  'red',
  'purple',
  'green_dark',
  'yellow_dark',
  'orange_dark',
  'red_dark',
  'purple_dark',
  'blue_light',
  'sky_light',
  'lime_light',
  'pink_light',
  'black_light',
  'blue',
  'sky',
  'lime',
  'pink',
  'black',
  'blue_dark',
  'sky_dark',
  'lime_dark',
  'pink_dark',
  'black_dark',
] as const

const knownLabelColors = new Set<string>(labelColors)

const toLabelColorClassSuffix = (color: string): string => {
  return color
    .split('_')
    .map((part) => {
      return `${part[0].toUpperCase()}${part.slice(1)}`
    })
    .join('')
}

export const getLabelColorClassName = (color: string | undefined): string => {
  if (!color || !knownLabelColors.has(color)) {
    return 'gpt-voiceCardLabelColorNeutral'
  }
  return `gpt-voiceCardLabelColor${toLabelColorClassSuffix(color)}`
}
