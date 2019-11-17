export interface RefundMessage {
  content: string
  createdAt: Date
  updatedAt: Date
  state: string
}

export function buildRefundMessage(
  {
    /** here my dependecies */
  },
): (refunderMsg: RefundMessage) => RefundMessage {
  return function RefundMessageEntity(refunderMsg: RefundMessage): RefundMessage {
    const { content, createdAt, updatedAt, state } = refunderMsg
    return {
      content,
      createdAt,
      updatedAt,
      state,
    }
  }
}
