import makeAddRefunderEvent from './addRefunderEvent'
import refunderDb from '../data-access'
const addRefunderEvent = makeAddRefunderEvent({ refunderDb })

const refunderEventService = Object.freeze({
  addRefunderEvent,
})
export default refunderEventService
export { addRefunderEvent }
