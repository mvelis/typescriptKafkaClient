import fs from 'fs'
import { ModuleBooter, Module, AModule } from '../index'
import logger from '../../../utils/logger'

interface ProjectSettings {
  createdAt: string
  name: string
  author: string
  version: string
}

export const boot: ModuleBooter = (): Module<AModule> => {
  try {
    const name = 'package-reader'
    const projectProperties = JSON.parse(fs.readFileSync(`${process.cwd()}/package.json`).toString())
    const settings: ProjectSettings = {
      createdAt: new Date().toISOString(),
      name: projectProperties.name,
      author: projectProperties.author,
      version: projectProperties.version,
    }

    return {
      name,
      context: settings,
      close: (): Promise<void> => {
        logger.info(`${name} closed`)
        return Promise.resolve()
      },
    }
  } catch (error) {
    logger.error(error.toString())
    throw error
  }
}
