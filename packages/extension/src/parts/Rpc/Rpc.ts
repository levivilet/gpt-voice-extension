export const invoke = async (
  method: string,
  ..._params: readonly any[]
): Promise<never> => {
  throw new Error(
    `Legacy Node RPC (${method}) is not supported for gpt-voice; token creation now uses OpenAI client secrets directly.`,
  )
}
