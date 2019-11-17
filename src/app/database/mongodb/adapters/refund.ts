import { RefundRepository } from '../../../repositories/refund'
import { Refund } from '../../../domain/entities/refund'
import { RefundModel } from '../models/refund'
import cuid from 'cuid' /** Q: export from utils? */

export const makeRefundMongoRepository = (): RefundRepository => {
  const save = async (refund: Refund): Promise<string> => {
    const refundModel = new RefundModel({
      id: cuid(),
      orderId: refund.orderId,
      amount: refund.amount,
      state: refund.state,
      createdAt: refund.createdAt,
      metadata: refund.metadata,
    })
    await refundModel.save()
    return `${refundModel.id}`
  }
  const update = async (refund: Refund): Promise<string> => {
    const refundModel = new RefundModel({
      id: cuid(),
      orderId: refund.orderId,
      amount: refund.amount,
      state: refund.state,
      createdAt: refund.createdAt,
      metadata: refund.metadata,
    })
    await refundModel.save()
    return `${refundModel.id}`
  }
  return { save, update }
}
