import * as Server from './server.ts'

export const commandMap = {
  'GptVoice.startServer': Server.startServer,
  'GptVoice.stopServer': Server.stopServer,
}
