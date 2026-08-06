import { expect, test } from '@jest/globals'
import { readFile } from 'node:fs/promises'

const genericEditorVariablePattern =
  /var\(--(?:Foreground|ForegroundMuted|InputForeground|InputBackground|InputBorder|ButtonForeground|ButtonBackground|ButtonHoverBackground|EditorBackground|SideBarBackground|SideBarBorder|WidgetBorder|ToolbarHoverBackground|TextLinkForeground|ErrorForeground|ErrorBackground|MainBackground)/
const oldDarkFallbackPattern =
  /#(?:181f1f|202929|121818|111616|314040|334040|087d90|006a7a|4dc8ff|aeb8b8|f4f4f4|f7f7f7|394545|2a3434)\b/i
const hardcodedDarkOverlayPattern = /rgba\((?:0,\s*0,\s*0|255,\s*255,\s*255)/
const labelChoiceTextColorPattern =
  /\.gpt-voiceCardLabelChoiceText \{[^}]*color: #ffffff;/s
const lightLabelTextColorPattern =
  /\.gpt-voiceCardLabelColorGreenLight \{[^}]*color: #172b4d;/s
const authFormMaxWidthPattern = /\.gpt-voiceAuthForm\s*\{[^}]*max-width: 760px;/

const readgpt-voiceCss = async (): Promise<string> => {
  return readFile(new URL('../media/gpt-voice.css', import.meta.url), 'utf8')
}

const getCssAfterTokenLayer = (css: string): string => {
  const endIndex = css.indexOf('}\n\n')
  if (endIndex === -1) {
    return css
  }
  return css.slice(endIndex + 3)
}

test('gpt-voice css defines local theme tokens from editor theme variables', async () => {
  const css = await readgpt-voiceCss()

  expect(css).toContain('.gpt-voiceView,\n.gpt-voiceBoardDetail {')
  expect(css).toContain('--gpt-voiceForeground: var(')
  expect(css).toContain('--WorkbenchForeground')
  expect(css).toContain('--ListForeground')
  expect(css).toContain('--SideBarForeground')
  expect(css).toContain('--gpt-voiceSurface: var(')
  expect(css).toContain('--MainBackground')
  expect(css).toContain('--PanelBackground')
  expect(css).toContain('--WidgetBackground')
  expect(css).toContain('--InputBoxBackground')
  expect(css).toContain('--gpt-voiceButtonBackground: var(')
  expect(css).toContain('--SplitButtonBackground')
  expect(css).toContain('--BadgeBackground')
  expect(css).toContain('--LinkForeground')
  expect(css).toContain('--gpt-voiceScrollbarThumb: var(')
  expect(css).toContain('--vscode-scrollbarSlider-background')
  expect(css).toContain('--EditorScrollBarBackground')
  expect(css).toContain('--gpt-voiceBorder: var(')
  expect(css).toContain('--ContrastBorder')
  expect(css).toContain('--InputBoxBorder')
})

test('gpt-voice scroll containers use native themed scrollbars', async () => {
  const css = await readgpt-voiceCss()

  expect(css).toContain(
    '.gpt-voiceLists,\n.gpt-voiceCards,\n.gpt-voiceCardDetailPanel {',
  )
  expect(css).toContain(
    'scrollbar-color: var(--gpt-voiceScrollbarThumb) var(--gpt-voiceScrollbarTrack);',
  )
})

test('gpt-voice component styles use local tokens instead of dark theme fallbacks', async () => {
  const css = await readgpt-voiceCss()
  const componentCss = getCssAfterTokenLayer(css)

  expect(componentCss).not.toMatch(genericEditorVariablePattern)
  expect(css).not.toMatch(oldDarkFallbackPattern)
  expect(css).not.toMatch(hardcodedDarkOverlayPattern)
})

test('gpt-voice readable content allows text selection', async () => {
  const css = await readgpt-voiceCss()

  expect(css).toContain('.gpt-voiceTitle,\n.gpt-voiceWelcome,')
  expect(css).toContain('.gpt-voiceCardDescriptionPreview,')
  expect(css).toContain('.gpt-voiceCardCommentText,')
  expect(css).toContain('user-select: text;')
})

test('gpt-voice auth form matches the welcome section maximum width', async () => {
  const css = await readgpt-voiceCss()

  expect(css).toMatch(authFormMaxWidthPattern)
})

test('gpt-voice card description preview uses pointer cursor', async () => {
  const css = await readgpt-voiceCss()

  expect(css).toContain('.gpt-voiceCardDescriptionPreview {')
  expect(css).toContain('cursor: pointer;')
})

test('gpt-voice label picker uses contrasting text colors', async () => {
  const css = await readgpt-voiceCss()

  expect(css).toMatch(labelChoiceTextColorPattern)
  expect(css).toMatch(lightLabelTextColorPattern)
})
