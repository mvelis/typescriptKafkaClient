export interface RefundGateway {
  response: string
}

export interface Refund {
  orderId: string
  amount: number
  state: string
  gateway?: RefundGateway
  createdAt: Date
  updatedAt?: Date
  metadata: string
}

export function buildRefund(
  {
    /** here my dependecies */
  },
): (re: Refund) => Refund {
  return function makeRefund(re: Refund): Refund {
    const { orderId, amount, state, createdAt, updatedAt, gateway, metadata } = re
    if (amount <= 0) throw new Error('refunds must be greater than zero')
    if (!orderId) throw new Error('orderId is required')
    return {
      orderId,
      amount,
      state,
      createdAt,
      updatedAt,
      gateway,
      metadata,
    }
  }
}
