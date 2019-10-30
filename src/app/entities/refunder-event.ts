export interface RefunderEventInfoInterface {
  content: string
  createdAt: Date
  updatedAt: Date
}

export interface MakeRefunderEventInterface {
  getContent: () => string
  getCreatedAt: () => Date
  getUpdatedAt: () => Date
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function buildMakeRefunderEvent(/* here my inyected dependencies */ {}) {
  return function makeEvent(re: RefunderEventInfoInterface): MakeRefunderEventInterface {
    if (re.content.length < 1) throw new Error('content must not be empty')
    return {
      getContent: (): string => re.content,
      getCreatedAt: (): Date => re.createdAt,
      getUpdatedAt: (): Date => re.updatedAt,
    }
  }
}
