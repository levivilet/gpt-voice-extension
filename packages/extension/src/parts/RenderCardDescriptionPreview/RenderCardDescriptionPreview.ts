import {
  AriaRoles,
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import { renderMarkdown } from '../RenderMarkdown/RenderMarkdown.ts'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'

export const renderCardDescriptionPreview = (
  description: string,
): readonly VirtualDomNode[] => {
  const trimmedDescription = description.trim()
  if (!trimmedDescription) {
    return [
      {
        childCount: 1,
        className: MergeClassNames.mergeClassNames(
          'gpt-voiceCardDescriptionPreview',
          'gpt-voiceCardDescriptionPlaceholder',
        ),
        name: 'editCardDescription',
        onClick: DomEventListenerFunctions.HandleClick,
        role: AriaRoles.None,
        type: VirtualDomElements.Div,
      },
      text(gpt-voiceStrings.addDetailedDescription()),
    ]
  }
  const markdown = renderMarkdown(description)
  return [
    {
      childCount: markdown.childCount,
      className: 'gpt-voiceCardDescriptionPreview',
      name: 'editCardDescription',
      onClick: DomEventListenerFunctions.HandleClick,
      role: AriaRoles.None,
      type: VirtualDomElements.Div,
    },
    ...markdown.dom,
  ]
}
