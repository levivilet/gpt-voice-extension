import {
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { gpt-voiceViewState } from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import { renderCardDescriptionEditor } from '../RenderCardDescriptionEditor/RenderCardDescriptionEditor.ts'
import { renderCardDescriptionHeader } from '../RenderCardDescriptionHeader/RenderCardDescriptionHeader.ts'
import { renderCardDescriptionPreview } from '../RenderCardDescriptionPreview/RenderCardDescriptionPreview.ts'

const renderCardDescriptionContent = (
  state: Readonly<gpt-voiceViewState>,
  description: string,
): readonly VirtualDomNode[] => {
  const { editingCardDescription } = state
  if (editingCardDescription) {
    return renderCardDescriptionEditor(state)
  }
  return renderCardDescriptionPreview(description)
}

export const renderCardDescription = (
  state: Readonly<gpt-voiceViewState>,
  description: string,
): readonly VirtualDomNode[] => {
  const content = renderCardDescriptionContent(state, description)
  return [
    {
      childCount: 2,
      className: 'gpt-voiceCardDescriptionSection',
      type: VirtualDomElements.Div,
    },
    ...renderCardDescriptionHeader(),
    ...content,
  ]
}
