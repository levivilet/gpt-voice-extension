import type { gpt-voiceBoardDetail } from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import type {
  gpt-voiceViewActionContext,
  gpt-voiceViewState,
} from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import { getCardCoverImageUrl } from '../CardCoverHelpers/CardCoverHelpers.ts'

const getBoardCoverImageUrls = (
  detail: Readonly<gpt-voiceBoardDetail>,
): readonly string[] => {
  const urls = new Set<string>()
  for (const list of detail.lists) {
    for (const card of list.cards) {
      const url = getCardCoverImageUrl(card)
      if (url) {
        urls.add(url)
      }
    }
  }
  return [...urls]
}

const resolveCoverImageUrl = async (
  context: gpt-voiceViewActionContext,
  url: string,
): Promise<readonly [string, string]> => {
  const state = context.state as gpt-voiceViewState
  if (!state.credentials) {
    return [url, '']
  }
  try {
    return [
      url,
      await context.imageCache.resolveImageUrl(url, state.credentials),
    ]
  } catch {
    return [url, '']
  }
}

export const resolveBoardCoverImages = async (
  context: gpt-voiceViewActionContext,
  boardId: string,
): Promise<void> => {
  const state = context.state as gpt-voiceViewState
  const detail = state.boardDetail
  if (!detail || detail.board.id !== boardId) {
    return
  }
  const unresolvedUrls = getBoardCoverImageUrls(detail).filter((url) => {
    return !state.coverImageUrls[url]
  })
  if (unresolvedUrls.length === 0) {
    return
  }
  const resolvedUrls = await Promise.all(
    unresolvedUrls.map((url) => {
      return resolveCoverImageUrl(context, url)
    }),
  )
  if (state.boardDetail?.board.id !== boardId) {
    return
  }
  const nextCoverImageUrls = { ...state.coverImageUrls }
  let changed = false
  for (const [sourceUrl, objectUrl] of resolvedUrls) {
    if (!objectUrl) {
      continue
    }
    nextCoverImageUrls[sourceUrl] = objectUrl
    changed = true
  }
  if (changed) {
    state.coverImageUrls = nextCoverImageUrls
    context.requestRerender()
  }
}
