import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import { gpt-voicePowerUpsUrl } from '../Constants/Constants.ts'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'

const renderWelcomeText = (value: string): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className: 'gpt-voiceWelcomeText',
      type: VirtualDomElements.Div,
    },
    text(value),
  ]
}

const renderWelcomeNote = (value: string): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className: 'gpt-voiceWelcomeNote',
      type: VirtualDomElements.Div,
    },
    text(value),
  ]
}

const renderWelcomeLink = (): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className: 'gpt-voiceWelcomeLink',
      href: gpt-voicePowerUpsUrl,
      rel: 'noopener noreferrer',
      target: '_blank',
      type: VirtualDomElements.A,
    },
    text(gpt-voicePowerUpsUrl),
  ]
}

const renderWelcomeStep = (
  number: string,
  children: readonly VirtualDomNode[],
  childCount: number,
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 2,
      className: 'gpt-voiceWelcomeStep',
      type: VirtualDomElements.Li,
    },
    {
      childCount: 1,
      className: 'gpt-voiceWelcomeStepNumber',
      type: VirtualDomElements.Span,
    },
    text(number),
    {
      childCount,
      className: 'gpt-voiceWelcomeStepText',
      type: VirtualDomElements.Span,
    },
    ...children,
  ]
}

const renderWelcomeSteps = (): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 3,
      className: 'gpt-voiceWelcomeSteps',
      type: VirtualDomElements.Ol,
    },
    ...renderWelcomeStep(
      '1',
      [text(gpt-voiceStrings.welcomePowerUp()), ...renderWelcomeLink(), text('.')],
      3,
    ),
    ...renderWelcomeStep('2', [text(gpt-voiceStrings.welcomeApiKey())], 1),
    ...renderWelcomeStep('3', [text(gpt-voiceStrings.welcomeToken())], 1),
  ]
}

export const renderWelcome = (): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 4,
      className: 'gpt-voiceWelcome',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'gpt-voiceWelcomeTitle',
      type: VirtualDomElements.H3,
    },
    text(gpt-voiceStrings.welcome()),
    ...renderWelcomeText(gpt-voiceStrings.welcomeDescription()),
    ...renderWelcomeSteps(),
    ...renderWelcomeNote(gpt-voiceStrings.welcomeSecurity()),
  ]
}
