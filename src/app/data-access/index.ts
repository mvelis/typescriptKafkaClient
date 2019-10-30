import makeCommentsDb from './refunder-event-db'
import makeDatabase from '../db'
const refunderDb = makeCommentsDb(makeDatabase)
export default refunderDb
