import { RefundMessageRepository } from '../../repositories/refund-message'
import { RefundMessage } from '../../entities/refund-message'
import { makeRefundMessage } from '../../entities'

const saveRefundMessage = async function(repository: RefundMessageRepository, message: RefundMessage): Promise<object> {
  const refundMsg = makeRefundMessage(message)
  try {
    return await repository.save(refundMsg)
  } catch (ex) {
    return ex
  }
}

const updateRefundMessage = async function(
  repository: RefundMessageRepository,
  message: RefundMessage,
): Promise<object> {
  const refundMsg = makeRefundMessage(message)
  try {
    return await repository.update(refundMsg)
  } catch (ex) {
    return ex
  }
}

export { saveRefundMessage, updateRefundMessage }
