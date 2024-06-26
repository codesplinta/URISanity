const URISanity = require('../dist/urisanity.cjs')

test('check param validity for GRPC URI using a params list', () => {
  const checkValid = URISanity.checkParamsOverWhiteList(
    'grpc://api.broker.rt-msg.io:443?user=sal%C3%A1ta',
    ['user']
  )

  expect(checkValid).toBe(true)
})

test('check param validity for GRPC URI using a param list with regex', () => {
  const checkValid = URISanity.checkParamsOverWhiteList(
    'grpc://api.broker.rt-msg.io:443?id=13440500AD',
    { 'id': /^(?:[\d]{8})(?:[A-Z]{2})$/ }
  )

  expect(checkValid).toBe(true)
})

test('check param value for HTTP URI', () => {
  const paramValue = URISanity.extractParamValueFromUri(
    'https://www.example.com?xyz=%200000#intro',
    'xyz'
  )

  expect(paramValue).toEqual(' 0000')
})

describe('check URIs for correctness for specified flag option', () => {
  test('URI for database connection string (JDBC:MariaDB) passes for flag option', () => {
    const sanitizedUrl = URISanity.vet('jdbc:mariadb://192.168.100.174/db', {
      allowDBConnectionStringURI: true
    })

    expect(sanitizedUrl).toEqual('jdbc:mariadb://192.168.100.174/db')
  })

  test('URI for database connection string (JDBC:MariaDB) fails for flag option', () => {
    const sanitizedUrl = URISanity.vet('jdbc:mariadb://192.168.100.174/db', {
      allowDBConnectionStringURI: false
    })

    expect(sanitizedUrl).toEqual('about:blank')
  })

  test('URI for database connection (PostgreSQL) string passes for flag option', () => {
    const sanitizedUrl = URISanity.vet('postgresql://auser@localhost/adb?connect_timeout=10&application_name=myapp', {
      allowDBConnectionStringURI: true
    })

    expect(sanitizedUrl).toEqual('postgresql://auser@localhost/adb?connect_timeout=10&application_name=myapp')
  })

  test('URI for database connection (PostgreSQL) string fails for flag option', () => {
    const sanitizedUrl = URISanity.vet('postgresql://auser@localhost/adb?connect_timeout=10&application_name=myapp', {
      allowDBConnectionStringURI: false
    })

    expect(sanitizedUrl).toEqual('about:blank')
  })
})

describe('check well-formed URIs', () => {
  test('blob URI passes flag option', () => {
    const sanitizedUrl = URISanity.vet('blob:https://www.good.foo.com/9f368042-bf23-42b6-b07c-54189d3b0e01', {
      allowWebTransportURI: true
    })

    expect(sanitizedUrl).toEqual('blob:https://www.good.foo.com/9f368042-bf23-42b6-b07c-54189d3b0e01')
  });

  test('mailto URI passes flag option', () => {
    const sanitizedUrl = URISanity.vet('mailto:hello@example.com', {
      allowWebTransportURI: true
    })

    expect(sanitizedUrl).toEqual('mailto:hello@example.com')
  })
})

describe('check badly formed or suspicious URIs', () => {
  test('file URI fails flag option', () => {
    const sanitizedUrl = URISanity.vet('file://www.airbnb.com/Users/xxx/Desktop/index.html', {
      allowWebTransportURI: true
    })

    expect(sanitizedUrl).toEqual('about:blank')
  })

  test('http URI with malicious JS code fails flag option', () => {
    const  sanitizedUrl = URISanity.vet('http://example.com/?<script>alert(document.domain);</script>', {
      allowWebTransportURI: true
    })

    expect(sanitizedUrl).toEqual('about:blank')
  })

  test('http URI with malicious markup script disguised as query string fails flag option', () => {
    const sanitizedUrl = URISanity.vet('http://example.com/"onmouseover="alert(1)"', {
      allowWebTransportURI: true
    })

    expect(sanitizedUrl).toEqual('about:blank')
  })

  test('http URI with multiple question mark characters in query string fails flag option', () => {
    const sanitizedUrl = URISanity.vet('https://wordcrest.com/api/intent/lock/?t=9204949949?t=9595005005?t=096989549983', {
      allowWebTransportURI: true
    })

    expect(sanitizedUrl).toEqual('about:blank')
  })

  test('blob URI fails flag option', () => {
    const sanitizedUrl = URISanity.vet('blob:https://www.foo-.evil.com/undefined', {
      allowWebTransportURI: false
    })

    expect(sanitizedUrl).toEqual('about:blank')
  });

  test('blob:file URI fails flag option', () => {
    const sanitizedUrl = URISanity.vet('blob:file:///cf368042-bf23-42b6-b07c-54189d3b0e01', {
      allowWebTransportURI: true
    })

    expect(sanitizedUrl).toEqual('about:blank')
  });

  test('AOL IM URI fails flag option', () => {
    const sanitizedUrl = URISanity.vet('aim:goim?screenname=notarealuser&message=This+joy+is+mine.', {
      allowWebTransportURI: true
    })

    expect(sanitizedUrl).toEqual('about:blank')
  })
})
