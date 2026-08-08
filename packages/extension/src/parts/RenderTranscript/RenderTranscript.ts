import {
  type VirtualDomNode,
  text,
  VirtualDomElements,
} from '@lvce-editor/virtual-dom-worker'
import type { IState, ITranscript } from '../CreateInstance/CreateInstance.ts'
import * as ClassNames from '../ClassNames/ClassNames.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'

const getItemClassName = (item: ITranscript): string => {
  if (item.type === 'ai') {
    return MergeClassNames.mergeClassNames(
      ClassNames.GptVoiceTranscriptItem,
      ClassNames.GptVoiceTranscriptItemAi,
    )
  }
  return MergeClassNames.mergeClassNames(
    ClassNames.GptVoiceTranscriptItem,
    ClassNames.GptVoiceTranscriptItemUser,
  )
}

const renderTranscriptItem = (item: ITranscript): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className: getItemClassName(item),
      type: VirtualDomElements.Div,
    },

    text(item.text),
  ]
}
export const renderTranscript = (state: IState): readonly VirtualDomNode[] => {
  const { transcripts } = state
  return [
    {
      childCount: transcripts.length,
      className: ClassNames.GptVoiceTranscript,
      type: VirtualDomElements.Div,
    },
    ...transcripts.flatMap(renderTranscriptItem),
  ]
}
