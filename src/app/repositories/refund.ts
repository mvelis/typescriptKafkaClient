import { Refund } from '../domain/entities/refund'

export interface RefundRepository {
  save: (refundInfo: Refund) => Promise<string>
  update: (refundInfo: Refund) => Promise<string>
  /*get: (id: string) => Promise<Refund> | Refund
  getAll: () => Promise<Refund>[]*/
}
