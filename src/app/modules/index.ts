import path from 'path'
import fs, { Dirent } from 'fs'
import logger from '../../utils/logger'

type DirTuple = [string, string]

export type ModuleBooter = () => Module | Promise<Module>
export interface Module {
  name: string
  close: () => Promise<void>
  context: object
}

export type ModulesLoader = () => Promise<Module[]>
export const loadModules: ModulesLoader = async (): Promise<Module[]> => {
  const modules: Module[] = []

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
