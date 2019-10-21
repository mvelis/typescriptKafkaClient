class AbstractError extends Error {
  private meta: object

  public constructor(message: string, meta: object = {}) {
    super(message)
    Error.captureStackTrace(this, this.constructor)
    this.name = this.constructor.name
    this.meta = meta
  }

  public toJSON(): object {
    return {
      message: this.message,
      metaData: this.meta,
    }
  }
}

export class ValidationError extends AbstractError {}
export class UnknownError extends AbstractError {}
export class UnauthorizeError extends AbstractError {}
export class NotFoundError extends AbstractError {
  public constructor(resource: string, type: string = '', meta: object = {}) {
    super(`Resource: ${resource} of type: ${type}, Not Found`, meta)
  }
}
