const url = require('url')
const WS = require('ws')
const express = require('express')

export class FlexBase {
  data = {}
  constructor({server, name}) {
    if (!server) throw new TypeError('We require a server!')
    this.wss = new WS.Server({noServer: true})
    server.on('upgrade', (req, socket, head) => {
      console.log('upgrading')
      const pathname = url.parse(req.url, true)
      if (pathname.href === '/flexbase') {
        this.wss.handleUpgrade(req, socket, head, ws => {
          ws.send(JSON.stringify({type: 'update', data: {hello:3}}))
          this.wss.emit('connection', ws)
          ws.send(JSON.stringify({type: 'update', data: this.data}))
          ws.on('message', msg => {
            this.handleMessage(msg, ws)
          })
        })
      }
    })
  }

  broadcast(msg, sender) {
    this.wss.clients.forEach(client => {
      if (client !== sender) client.send(JSON.stringify(msg))
    })
  }

  update(update, sender) {
    const toBroadcast = {}
    for (const key in update) {
      if (this.data[key] !== update[key])
        this.data[key] = toBroadcast[key] = update[key]
    }
    if (Object.keys(toBroadcast).length)
      this.broadcast({type: 'update', data: toBroadcast}, sender)
  }

  handleMessage(msg, sender) {
    const parsed = JSON.parse(msg)
    console.log(msg)
    if (parsed.type === 'update') {
      this.update(parsed.data, sender)
    }
  }
}

