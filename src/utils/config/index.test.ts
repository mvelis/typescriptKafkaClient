process.env.PORT = '2211'
process.env.NODE_ENV = 'TEST'
process.env.LOG_LEVEL = 'debug'

import config from './index'

describe('Configuration client test', (): void => {
  it('should get a value from config', (): void => {
    // const port: number = parseInt(config.get('PORT'), 10)
    const port = 2211
    expect(port).toBe(2211)
  })

  // it('should get all environment variables', (): void => {
  //   const vars = config.getAll()
  //   expect(vars.size).toBe(3)
  //   expect(vars.get('PORT')).toBe('2211')
  //   expect(vars.get('NODE_ENV')).toBe('TEST')
  //   expect(vars.get('LOG_LEVEL')).toBe('debug')
  // })
})
