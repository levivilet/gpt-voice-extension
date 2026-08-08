interface State {
  readonly animationScale: number
}

const gptVoiceSelector = '.GptVoice'

export const getCss = (state: Readonly<State>): string => {
  const { animationScale } = state
  return `${gptVoiceSelector} {
--GptVoiceBubbleTransform: scale(${animationScale});
}`
}
