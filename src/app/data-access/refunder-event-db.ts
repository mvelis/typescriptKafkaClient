import cuid from 'cuid'
//Q: importar entidades en esta capa respeta clean architecture
import { RefunderEventInfoInterface } from '../entities/refunder-event'

export interface RefunderEventDbInterface {
  insert: (
    refunderEvent: RefunderEventInfoInterface,
  ) => Promise<RefunderEventInfoInterface | Error> /* Q: tipo de promesa a retornar? */
}

export default function makeRefunderEventDb(makeDb: any): RefunderEventDbInterface {
  const collection = 'refunder_event'
  async function insert(refunderEvent: RefunderEventInfoInterface): Promise<RefunderEventInfoInterface | Error> {
    const db = await makeDb()
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    return new Promise<RefunderEventInfoInterface>((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      db.collection(collection).insertOne({ _id: cuid(), ...refunderEvent }, (err: Error, result: any) => {
        if (err) return reject(err)
        if (!result.result) return reject(err)
        return resolve(result.result)
      })
    })
  }
  return Object.freeze({
    insert,
  })
}
