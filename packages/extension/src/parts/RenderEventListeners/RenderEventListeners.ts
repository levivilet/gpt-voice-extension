interface DomEventListener {
  readonly name: string | number
  readonly params: readonly string[]
  readonly preventDefault?: boolean
  readonly trackPointerEvents?: readonly (string | number)[]
}

export const renderEventListeners = (): readonly DomEventListener[] => {
  return [
    {
      name: 'handleClickStart',
      params: ['handleClickStart'],
    },
  ]
}
