import { RefundRepository } from '../../../repositories/refund'
import { Refund } from '../../entities/refund'
import { makeRefund } from '../../entities'

const saveRefund = async function(repository: RefundRepository, message: Refund): Promise<string> {
  const refundMsg = makeRefund(message)
  try {
    const save = await repository.save(refundMsg)
    return save
  } catch (ex) {
    return ex
  }
}

const updateRefund = async function(repository: RefundRepository, message: Refund): Promise<string> {
  const refundMsg = makeRefund(message)
  try {
    return await repository.update(refundMsg)
  } catch (ex) {
    return ex
  }
}

export { saveRefund, updateRefund }
