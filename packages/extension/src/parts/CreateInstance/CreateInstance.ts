import type {
  ViewContext,
  ViewSelection,
  VirtualDomViewInstance,
} from '@lvce-editor/api'
import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { getTitle } from '../GetTitle/GetTitle.ts'
import { type MenuEntry } from '../MenuEntries/MenuEntries.ts'

export interface ActiveTrelloViewInstance extends VirtualDomViewInstance {
  readonly getContext: () => Readonly<Record<string, boolean>>
  readonly getCss: () => string
  readonly getMenuEntries: (menuId: string) => readonly MenuEntry[]

  readonly renderTitle: () => string
  readonly submitNewCard: () => Promise<void>
}

const activeInstances = new Set<ActiveTrelloViewInstance>()

const getActiveInstance = (): ActiveTrelloViewInstance | undefined => {
  let activeInstance: ActiveTrelloViewInstance | undefined
  for (const instance of activeInstances) {
    activeInstance = instance
  }
  return activeInstance
}

const becameActive = (
  oldContext: Readonly<Record<string, boolean>>,
  newContext: Readonly<Record<string, boolean>>,
  key: string,
): boolean => {
  return !oldContext[key] && newContext[key]
}

const getSavedFilterValue = (savedState: unknown): string => {
  if (
    !savedState ||
    typeof savedState !== 'object' ||
    !('filterValue' in savedState) ||
    typeof savedState.filterValue !== 'string'
  ) {
    return ''
  }
  return savedState.filterValue
}

export const backToBoardsActiveTrelloViewInstance = async (): Promise<void> => {
  await getActiveInstance()?.backToBoards()
}

export const cancelNewCardActiveTrelloViewInstance = (): void => {
  getActiveInstance()?.cancelNewCard()
}

export const addList = async (options: any): Promise<void> => {
  await getActiveInstance()?.addList(options)
}
export const addCard = async (options: any): Promise<void> => {
  await getActiveInstance()?.addCard(options)
}
export const openMockBoard = async (options: any): Promise<void> => {
  await getActiveInstance()?.openMockBoard(options)
}

export const closeCardDetailActiveTrelloViewInstance = (): void => {
  getActiveInstance()?.closeCardDetail()
}

export const closeBoardFilterActiveTrelloViewInstance = (): void => {
  getActiveInstance()?.closeBoardFilter()
}

export const logoutActiveTrelloViewInstance = async (): Promise<void> => {
  await getActiveInstance()?.logout()
}

export const refreshBoardsActiveTrelloViewInstance =
  async (): Promise<void> => {
    await getActiveInstance()?.refreshBoards()
  }

export const saveCardDetailActiveTrelloViewInstance =
  async (): Promise<void> => {
    await getActiveInstance()?.saveCardDetail()
  }

export const startAddCardActiveTrelloViewInstance = (listId: string): void => {
  getActiveInstance()?.startAddCard(listId)
}

export const openCardActiveTrelloViewInstance = async (
  cardId: string,
): Promise<void> => {
  await getActiveInstance()?.openCard(cardId)
}

export const submitNewCardActiveTrelloViewInstance =
  async (): Promise<void> => {
    await getActiveInstance()?.submitNewCard()
  }

export const reloadActiveTrelloViewInstances = async (): Promise<void> => {
  await Promise.all(
    activeInstances.values().map((instance) => {
      return instance.reload()
    }),
  )
}

export const createInstance = async (
  context?: ViewContext,
): Promise<ActiveTrelloViewInstance> => {
  const state = {}
  const viewContext = {
    client: undefined as never,
    currentBoardStorage: {},
    imageCache: undefined as never,
    recentStorage: undefined as never,
    requestRerender: undefined as never,
    showContextMenu: undefined as never,
    state,
    storage: undefined as never,
  }

  const requestRerender = (): void => {
    // @ts-ignore
    const request = context?.requestRerender
    if (!request) {
      return
    }
    globalThis.setTimeout(() => {
      void request()
    }, 0)
  }

  const showContextMenu = async (
    menuId: string,
    x: number,
    y: number,
  ): Promise<void> => {
    const request = (context as any)?.showContextMenu
    if (!request) {
      return
    }
    await request(menuId, x, y)
  }

  const initialize = async (rerender: boolean): Promise<void> => {
    if (rerender) {
      requestRerender()
    }
  }

  await initialize(false)

  const instance: ActiveTrelloViewInstance = {
    async addCard({
      listId,
      name,
    }: {
      readonly name: string
      readonly listId: string
    }): Promise<void> {
      // TODO make this one function
      await instance?.handleEvent?.({
        name: 'startAddList',
        type: 'click',
      })
      await instance?.handleEvent?.({
        name: 'newListTitle',
        type: 'input',
        value: name,
      })
      await instance?.handleEvent?.({
        name: 'addList',
        type: 'submit',
      })
    },
    async addList({ name }: { readonly name: string }): Promise<void> {
      // TODO make this one function
      await instance?.handleEvent?.({
        name: 'startAddList',
        type: 'click',
      })
      await instance?.handleEvent?.({
        name: 'newListTitle',
        type: 'input',
        value: name,
      })
      await instance?.handleEvent?.({
        name: 'addList',
        type: 'submit',
      })
    },

    closeCardDetail(): void {
      closeCardDetailAction(viewContext)
      updateContext(state)
    },

    render(): readonly VirtualDomNode[] {
      if (!state.credentials) {
        return renderAuth(state)
      }
      if (state.boardDetail) {
        return renderBoardDetail(state, state.boardDetail)
      }
      return renderBoards(state)
    },
    renderActionsDom(): readonly VirtualDomNode[] {
      return renderActionsDom(state)
    },
    renderFocus(
      oldContext: Readonly<Record<string, boolean>>,
      newContext: Readonly<Record<string, boolean>>,
    ): string {
      if (becameActive(oldContext, newContext, contextKeyBoardFilterFocus)) {
        return '[name="boardFilter"]'
      }
      if (
        becameActive(oldContext, newContext, contextKeyCardLabelPickerFocus)
      ) {
        return '[name="cardLabelSearch"]'
      }
      if (
        becameActive(oldContext, newContext, contextKeyNewCardInputFocus) &&
        state.addingCardListId
      ) {
        return `[name="newCardTitle:${state.addingCardListId}"]`
      }
      if (becameActive(oldContext, newContext, contextKeyNewListInputFocus)) {
        return '[name="newListTitle"]'
      }
      if (
        becameActive(oldContext, newContext, contextKeyCardDescriptionFocus)
      ) {
        return '[name="cardDescription"]'
      }
      return ''
    },
    renderSelections(): readonly ViewSelection[] {
      const selections = state.pendingSelections
      state.pendingSelections = []
      return selections
    },
    renderTitle(): string {
      return getTitle(state)
    },
    async saveCardDetail(): Promise<void> {
      await saveCardDetailAction(viewContext)
      updateContext(state)
    },
    saveState(): unknown {
      return {
        boardId: state.boardDetail?.board.id,
        cardId: state.selectedCardDetail?.card.id,
        filterValue: state.draftBoardFilter,
        isAuthenticated: Boolean(state.credentials),
      }
    },
    startAddCard(listId: string): void {
      startAddCard(viewContext, listId)
      updateContext(state)
    },
    async submitNewCard(): Promise<void> {
      if (!state.addingCardListId) {
        return
      }
      await submitAddCard(viewContext, `addCard:${state.addingCardListId}`)
      updateContext(state)
    },
  }
  activeInstances.add(instance)
  return instance
}
