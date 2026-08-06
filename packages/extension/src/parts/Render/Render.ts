import {
  type VirtualDomNode,
  text,
  VirtualDomElements,
} from '@lvce-editor/virtual-dom-worker'

export const render = (): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className: 'gpt-voice',
      type: VirtualDomElements.Div,
    },
    text('hello world 123'),
  ]
}
