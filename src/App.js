import React, {useRef} from 'react';
import './App.css';

var nats = require('nats.ws')


function App() {

  const Log = useRef(null);
  const Input = useRef(null);
  const Send = useRef(null);

  const Payload = nats.Payload
  const me = Date.now()

  // create a connection, and register listeners
  const init = async function () {
    // if the connection doesn't resolve, an exception is thrown
    // a real app would allow configuring the URL
    const conn = await nats.connect({ url: 'wss://localhost:9222', payload: Payload.JSON })

    // handle errors sent by the gnatsd - permissions errors, etc.
    conn.addEventListener('error', (ex) => {
      addEntry(`Received error from NATS: ${ex}`)
    })

    // handle connection to the server is closed - should disable the ui
    conn.addEventListener('close', () => {
      addEntry('NATS connection closed')
    })

    // the chat application listens for messages sent under the subject 'chat'
    conn.subscribe('chat', (_, msg) => {
      addEntry(msg.data.id === me ? `(me): ${msg.data.m}` : `(${msg.data.id}): ${msg.data.m}`)
    })

    // when a new browser joins, the joining browser publishes an 'enter' message
    conn.subscribe('enter', (_, msg) => {
      if (msg.data.id !== me) {
        addEntry(`${msg.data.id} entered.`)
      }
    })

    // when a browser closes, the leaving browser publishes an 'exit' message
    conn.subscribe('exit', (_, msg) => {
      if (msg.data.id !== me) {
        addEntry(`${msg.data.id} exited.`)
      }
    })

    // we connected, and we publish our enter message
    conn.publish('enter', { id: me })
    return conn
  }

  init().then(conn => {
    window.nc = conn
  }).catch(ex => {
    addEntry(`Error connecting to NATS: ${ex}`)
  })

  // add a listener to detect edits. If they hit Enter, we publish it
  function trysend (e) {
    if (e.key === 'Enter') {
      send()
    } else {
      e.preventDefault()
    }
  }

  // send a message if user typed one
  function send () {
    const m = Input.current.value
    if (m !== '' && window.nc) {
      window.nc.publish('chat', { id: me, m: m })
      Input.current.value = ''
    }
    return false
  }

  // // send the exit message
  // function exiting () {
  //   if (window.nc) {
  //     window.nc.publish('exit', { id: me })
  //   }
  // }

  // add an entry to the document
  function addEntry (s) {
    console.log(s);
  }


  return (
    <div className="App">
      <div ref={Log} className="container"></div>
      <br/>
      <div className="container">
        <h1>ws-nats chat</h1>
        <input type="text" className="form-control" ref={Input} placeholder="Message" autoComplete="off" onKeyUp={trysend}/><br/><br/><br/>
        <button ref={Send} onClick={send} className="btn btn-primary">Send</button>
      </div>
    </div>
  );
}

export default App;
