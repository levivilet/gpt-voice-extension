import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { gpt-voiceViewState } from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import { renderError } from '../RenderError/RenderError.ts'
import { renderField } from '../RenderField/RenderField.ts'
import { renderWelcome } from '../RenderWelcome/RenderWelcome.ts'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'

export const renderAuth = (
  state: Readonly<gpt-voiceViewState>,
): readonly VirtualDomNode[] => {
  const { draftApiKey, draftToken, error, loading } = state
  const errorDom = renderError(error)
  return [
    {
      childCount: 2,
      className: MergeClassNames.mergeClassNames('gpt-voiceView', 'gpt-voiceAuth'),
      type: VirtualDomElements.Div,
    },
    {
      childCount: 2 + (errorDom.length > 0 ? 1 : 0),
      className: 'gpt-voiceAuthForm',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 2,
      className: 'gpt-voiceAuthFields',
      type: VirtualDomElements.Div,
    },
    ...renderField(gpt-voiceStrings.apiKey(), 'apiKey', draftApiKey),
    ...renderField(gpt-voiceStrings.token(), 'token', draftToken, 'password'),
    {
      childCount: 1,
      className: 'gpt-voiceButton',
      name: 'connect',
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    text(loading ? gpt-voiceStrings.connecting() : gpt-voiceStrings.connect()),
    ...errorDom,
    ...renderWelcome(),
  ]
}
