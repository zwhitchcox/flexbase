import { FlexBase as FlexBaseServer } from './server.flexbase'
import { FlexBase as FlexBaseClient } from './client.flexbase'
const PORT = ((Math.random()*4000)+3000) | 0
const express = require('express')
const app = express()
const flexbase = {}

let client1, client2;
beforeAll(done => {
  const server = app.listen(PORT, () => {
    flexbase.server = new FlexBaseServer({server, name: 'server'})

    client1 = new FlexBaseClient({
      url: `ws://localhost:${PORT}/flexbase`,
      name: 'client 1',
    })

    client2 = new FlexBaseClient({
      url: `ws://localhost:${PORT}/flexbase`,
      name: 'client 2',
    })

    done()
  })
})


test('propagates to both clients', async () => {
  const update1 = {clienthello1: 'hi1'}
  const update2 = {clienthello2: 'hi2'}
  client1.update(update1)
  client2.update(update2)

  return waitUntil(() => checkData(client1, update2) && checkData(client2, update1))
}, 2000)
