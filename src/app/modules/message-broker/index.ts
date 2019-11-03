import logger from '../../../utils/logger'
import { ModuleBooter, Module, AModule } from '../index'

export const boot: ModuleBooter = (): Module<AModule> => {
  const name = 'message-broker'

  return {
    name,
    context: {},
    close: (): Promise<void> => {
      logger.info(`${name} closed`)
      return Promise.resolve()
    },
  }
}
