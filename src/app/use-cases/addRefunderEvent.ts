import makeRefunderEvent from '../entities/'
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function makeAddRefunderEvent(db: any) {
  return function addRefunderEvent(refunderInfo: any /**aqui se exporta la interface de entity? */): any {
    const refunderEvent = makeRefunderEvent(refunderInfo)
    return db.refunderDb.insert({
      content: refunderEvent.getContent(),
      createdAt: refunderEvent.getCreatedAt(),
      updatedAt: refunderEvent.getUpdatedAt(),
    })
  }
}
