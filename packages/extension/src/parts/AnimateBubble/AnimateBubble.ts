export interface AnimationResult {
  readonly enabled: boolean
  readonly scale: number
}

export const animateBubble = (
  micLevel: number,
  aiLevel: number,
): AnimationResult => {
  const level = Math.max(micLevel, aiLevel)
  const scale = 1 + Math.min(level * 3.2, 0.9)
  const enabled = micLevel > aiLevel && micLevel > 0.03
  return {
    enabled,
    scale,
  }
}
