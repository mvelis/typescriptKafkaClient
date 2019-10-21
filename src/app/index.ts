import emoji from 'node-emoji'
import logger from '../utils/logger'
import { EventEmitter } from 'events'
import { Module, ModulesLoader } from './modules'

interface AppContext {
  [key: string]: Module
}

export interface Application extends EventEmitter {
  context: AppContext
  boot: () => Promise<void>
  start: (callback: Function) => void
  close: () => void
}

export function makeApp(loadModules: ModulesLoader): Application {
  const app = new EventEmitter() as Application

  app.context = {}
  app.boot = async (): Promise<void> => {
    logger.setPrefix('init')
    logger.info(`Starting at ${new Date().toISOString()}`)
    console.log('')
    logger.setPrefix('boot')
    logger.info(`Booting application ${emoji.get('coffee')}`)

    try {
      const modules = await loadModules()

      const emptyContexStarter: AppContext = {}
      app.context = modules.reduce((prev, current): AppContext => {
        prev[current.name] = { ...current }
        return prev
      }, emptyContexStarter)

      app.emit('application:booted', app)
    } catch (error) {
      logger.error(error.toString())
      process.exit(1)
    }
  }

  app.start = (callback: Function): void => {
    console.log('')
    logger.setPrefix('run')
    logger.info(`Application started ${emoji.get('grin')}`)

    callback()
  }

  app.close = (): void => {
    logger.setPrefix('shutdown')
    Object.keys(app.context).forEach(
      (moduleName): void => {
        app.context[moduleName].close()
      },
    )
    logger.info(`Application closed ${emoji.get('sleeping')}`)
  }

  return app
}
