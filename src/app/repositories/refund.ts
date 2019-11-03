import { Refund } from '../entities/refund'

export interface RefundRepository {
  save: (refundInfo: Refund) => Promise<string>
  /*update: (refundInfo: Refund) => Promise<Refund>
  get: (id: string) => Promise<Refund> | Refund
  getAll: () => Promise<Refund>[]*/
}
