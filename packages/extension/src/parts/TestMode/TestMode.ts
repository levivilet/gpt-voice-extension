const testModeState = {
  isEnabled: false,
}

export const enableTestMode = (): void => {
  testModeState.isEnabled = true
}

export const isInTestMode = (): boolean => {
  return testModeState.isEnabled
}
