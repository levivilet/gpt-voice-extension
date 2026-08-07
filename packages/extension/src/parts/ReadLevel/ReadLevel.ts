export const readLevel = (data: Uint8Array): number => {
  if (data.length === 0) {
    return 0
  }
  let sumSquares = 0
  for (let i = 0; i < data.length; i++) {
    const v = (data[i] - 128) / 128
    sumSquares += v * v
  }
  return Math.sqrt(sumSquares / data.length) // ~0 (silence) to ~0.6 (loud)
}
