import {
  activate as activateExtensionApi,
  executeCommand,
  registerCommand,
  registerView,
} from '@lvce-editor/api'
import { enableTestMode } from '../TestMode/TestMode.ts'
import { view } from '../View/View.ts'

const floatingWindowUrl =
  'lvce-oss://-/?floatingWindowMode=extensionView&floatingExtensionViewId=gpt-voice.views.default'

const state = {
  isActivated: false,
}

export const activate = async (): Promise<void> => {
  if (state.isActivated) {
    return
  }
  state.isActivated = true
  await activateExtensionApi()
  registerView(view)
  registerCommand({
    async execute() {
      await executeCommand('Open.openUrl', floatingWindowUrl)
    },
    id: 'gpt-voice.show',
  })
  registerCommand({
    async execute() {
      enableTestMode()
    },
    id: 'GptVoice.setIsTest',
  })
}
