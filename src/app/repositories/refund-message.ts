import { RefundMessage } from '../entities/refund-message'

export interface RefundMessageRepository {
  save: (msg: RefundMessage) => Promise<RefundMessage>
  update: (refundInfo: RefundMessage) => Promise<RefundMessage>
  get: (id: string) => Promise<RefundMessage> | RefundMessage
  getAll: () => Promise<RefundMessage>[]
}
