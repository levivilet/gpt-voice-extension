interface DomEventListener {
  readonly name: string | number
  readonly params: readonly string[]
  readonly preventDefault?: boolean
  readonly trackPointerEvents?: readonly (string | number)[]
}

export const renderEventListeners = (): readonly DomEventListener[] => {
  return [
    {
      name: 'handleOpenAiApiKeyInput',
      params: ['handleOpenAiApiKeyInput', 'event.target.value'],
    },
    {
      name: 'handleClearOpenAiApiKey',
      params: ['handleClearOpenAiApiKey'],
    },
    {
      name: 'handleSaveOpenAiApiKey',
      params: ['handleSaveOpenAiApiKey'],
    },
    {
      name: 'handleClickStart',
      params: ['handleClickStart'],
    },
    {
      name: 'setRealtimeModelMini',
      params: ['setRealtimeModelMini'],
    },
    {
      name: 'setRealtimeModelStandard',
      params: ['setRealtimeModelStandard'],
    },
  ]
}
