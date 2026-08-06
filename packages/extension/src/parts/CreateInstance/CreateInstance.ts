import type {
  ViewContext,
  ViewSelection,
  VirtualDomViewInstance,
} from '@lvce-editor/api'
import { type VirtualDomNode, text } from '@lvce-editor/virtual-dom-worker'
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
    render(): readonly VirtualDomNode[] {
      return [text('hello world')]
    },
    renderActionsDom(): readonly VirtualDomNode[] {
      return [text('hello world')]
    },
    renderFocus(
      oldContext: Readonly<Record<string, boolean>>,
      newContext: Readonly<Record<string, boolean>>,
    ): string {
      return ''
    },
    renderSelections(): readonly ViewSelection[] {
      return []
    },
    renderTitle(): string {
      return getTitle(state)
    },

    saveState(): unknown {
      return {}
    },
  }
  activeInstances.add(instance)
  return instance
}
