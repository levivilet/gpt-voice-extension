import {
  type VirtualDomNode,
  text,
  VirtualDomElements,
} from '@lvce-editor/virtual-dom-worker'
import type {
  IMessage,
  IState,
  IToolCallMessage,
  ITranscript,
} from '../CreateInstance/CreateInstance.ts'
import * as ClassNames from '../ClassNames/ClassNames.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import { formatToolCallValue } from '../ToolCall/ToolCall.ts'

const toolCallSectionNode: VirtualDomNode = {
  childCount: 2,
  className: ClassNames.GptVoiceToolCallSection,
  type: VirtualDomElements.Div,
}

const toolCallLabelNode: VirtualDomNode = {
  childCount: 1,
  className: ClassNames.GptVoiceToolCallLabel,
  type: VirtualDomElements.Div,
}

const toolCallValueNode: VirtualDomNode = {
  childCount: 1,
  className: ClassNames.GptVoiceToolCallValue,
  type: VirtualDomElements.Pre,
}

const toolCallDetailsNode: VirtualDomNode = {
  childCount: 2,
  className: ClassNames.GptVoiceToolCallDetails,
  type: VirtualDomElements.Div,
}

const getTranscriptClassName = (item: ITranscript): string => {
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
      className: getTranscriptClassName(item),
      type: VirtualDomElements.Div,
    },
    text(item.text),
  ]
}

const getToolCallSummary = (item: IToolCallMessage): string => {
  if (item.status === 'failed') {
    return `Failed ${item.name}`
  }
  if (item.status === 'in-progress') {
    return `Running ${item.name}…`
  }
  return `Ran ${item.name}`
}

const getToolCallStatusIcon = (item: IToolCallMessage): string => {
  if (item.status === 'failed') {
    return '!'
  }
  if (item.status === 'in-progress') {
    return '●'
  }
  return '✓'
}

const renderToolCallSection = (
  label: string,
  value: string,
): readonly VirtualDomNode[] => {
  return [
    toolCallSectionNode,
    toolCallLabelNode,
    text(label),
    toolCallValueNode,
    text(formatToolCallValue(value)),
  ]
}

const renderToolCallDetails = (
  item: IToolCallMessage,
): readonly VirtualDomNode[] => {
  if (!item.expanded) {
    return []
  }
  const output =
    item.status === 'in-progress' ? 'Waiting for tool output…' : item.output
  return [
    toolCallDetailsNode,
    ...renderToolCallSection('Arguments', item.argumentsValue),
    ...renderToolCallSection('Output', output),
  ]
}

const renderToolCall = (item: IToolCallMessage): readonly VirtualDomNode[] => {
  return [
    {
      childCount: item.expanded ? 2 : 1,
      className: MergeClassNames.mergeClassNames(
        ClassNames.GptVoiceToolCall,
        item.status,
      ),
      type: VirtualDomElements.Div,
    },
    {
      ariaExpanded: item.expanded,
      childCount: 3,
      className: ClassNames.GptVoiceToolCallButton,
      name: item.id,
      onClick: DomEventListenerFunctions.ToggleToolCall,
      type: VirtualDomElements.Button,
    },
    {
      childCount: 1,
      className: ClassNames.GptVoiceToolCallStatus,
      name: item.id,
      type: VirtualDomElements.Span,
    },
    text(getToolCallStatusIcon(item)),
    {
      childCount: 1,
      className: ClassNames.GptVoiceToolCallSummary,
      name: item.id,
      type: VirtualDomElements.Span,
    },
    text(getToolCallSummary(item)),
    {
      childCount: 1,
      className: ClassNames.GptVoiceToolCallChevron,
      name: item.id,
      type: VirtualDomElements.Span,
    },
    text(item.expanded ? '⌃' : '⌄'),
    ...renderToolCallDetails(item),
  ]
}

const renderMessage = (item: IMessage): readonly VirtualDomNode[] => {
  if (item.type === 'tool') {
    return renderToolCall(item)
  }
  return renderTranscriptItem(item)
}

export const renderTranscript = (state: IState): readonly VirtualDomNode[] => {
  const { messages } = state
  return [
    {
      childCount: messages.length,
      className: ClassNames.GptVoiceTranscript,
      type: VirtualDomElements.Div,
    },
    ...messages.flatMap(renderMessage),
  ]
}
