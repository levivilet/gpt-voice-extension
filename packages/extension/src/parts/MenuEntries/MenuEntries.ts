export const MenuIdBoard = 'gptvoice.board'
export const MenuIdCard = 'gptvoice.card'
export const MenuIdCardDetail = 'gptvoice.cardDetail'
export const MenuIdList = 'gptvoice.list'

export interface MenuEntry {
  readonly args?: readonly string[]
  readonly command: string
  readonly id: string
  readonly label: string
}

export const getMenuEntries = (
  state: Readonly<any>,
  menuId: string,
): readonly MenuEntry[] => {
  return []
}
