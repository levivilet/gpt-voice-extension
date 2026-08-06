// cspell:ignore prefs

import type {
  gpt-voiceBoard,
  gpt-voiceBoardBackgroundImage,
} from '../gpt-voiceTypes/gpt-voiceTypes.ts'

const hexColorPattern = /^#[\da-f]{3}(?:[\da-f]{3})?(?:[\da-f]{2})?$/i

const escapeCssString = (value: string): string => {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('"', '\\"')
    .replaceAll('\n', '\\a ')
    .replaceAll('\r', '\\d ')
    .replaceAll('\f', '\\c ')
}

const getImageSize = (image: Readonly<gpt-voiceBoardBackgroundImage>): number => {
  return (image.width || 0) * (image.height || 0)
}

const getLargestBackgroundImage = (
  images: readonly gpt-voiceBoardBackgroundImage[] | undefined,
): string => {
  if (!images || images.length === 0) {
    return ''
  }
  let largest = images[0]
  for (const image of images) {
    if (getImageSize(image) > getImageSize(largest)) {
      largest = image
    }
  }
  return largest.url || ''
}

const getBackgroundImage = (board: Readonly<gpt-voiceBoard>): string => {
  return (
    getLargestBackgroundImage(board.prefs?.backgroundImageScaled) ||
    board.prefs?.backgroundImage ||
    ''
  )
}

const getBackgroundColor = (board: Readonly<gpt-voiceBoard>): string => {
  const color =
    board.prefs?.backgroundBottomColor ||
    board.prefs?.backgroundTopColor ||
    board.prefs?.backgroundColor ||
    ''
  if (!hexColorPattern.test(color)) {
    return ''
  }
  return color
}

const hasBoardBackground = (board: Readonly<gpt-voiceBoard>): boolean => {
  return Boolean(getBackgroundImage(board) || getBackgroundColor(board))
}

export const getBoardBackgroundClassName = (
  board: Readonly<gpt-voiceBoard>,
  enabled: boolean,
): string => {
  if (!enabled || !hasBoardBackground(board)) {
    return 'gpt-voiceView gpt-voiceBoardDetail'
  }
  return 'gpt-voiceView gpt-voiceBoardDetail gpt-voiceBoardDetailWithBackground'
}

export const getBoardBackgroundCss = (
  board: Readonly<gpt-voiceBoard>,
  enabled: boolean,
): string => {
  if (!enabled) {
    return ''
  }
  const properties: string[] = []
  const image = getBackgroundImage(board)
  const color = getBackgroundColor(board)
  if (image) {
    properties.push(
      `--gpt-voiceBoardBackgroundImage: url("${escapeCssString(image)}")`,
    )
    properties.push(
      `--gpt-voiceBoardBackgroundRepeat: ${
        board.prefs?.backgroundTile ? 'repeat' : 'no-repeat'
      }`,
    )
    properties.push(
      `--gpt-voiceBoardBackgroundSize: ${
        board.prefs?.backgroundTile ? 'auto' : 'cover'
      }`,
    )
  }
  if (color) {
    properties.push(`--gpt-voiceBoardBackgroundColor: ${color}`)
  }
  if (properties.length === 0) {
    return ''
  }
  return `.gpt-voiceBoardDetailWithBackground {
  ${properties.join(';\n  ')};
}`
}
