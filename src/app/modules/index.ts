import path from 'path'
import fs, { Dirent } from 'fs'
import logger from '../../utils/logger'
import { MongoClientDb } from '../database/mongodb/client/mongo-client'
import { KafkaClientInterface } from '../modules/kafka-queue/interfaces'

export type AModule = MongoClientDb | KafkaClientInterface | object

type DirTuple = [string, string]

export type ModuleBooter = () => Module<AModule> | Promise<Module<AModule>>
export interface Module<T> {
  name: string
  close: () => Promise<void>
  context: T
}

export type ModulesLoader = () => Promise<Module<AModule>[]>
export const loadModules: ModulesLoader = async (): Promise<Module<AModule>[]> => {
  const modules: Module<AModule>[] = []

  const modulePaths = fs
    .readdirSync(__dirname, { withFileTypes: true })
    .filter((folder: Dirent): boolean => folder.isDirectory())
    .map((folder: Dirent): DirTuple => [folder.name, path.join(__dirname, folder.name)])

  for (const [moduleName, modulePath] of modulePaths) {
    const { boot } = await import(modulePath)
    modules.push(await boot())
    logger.info(`Module -> ${moduleName} ... loaded`)
  }

  return modules
}
