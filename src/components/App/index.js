import React, { Component } from 'react'

import Table from '../Table'

class App extends Component {
  render() {
    return(
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Table />
      </div>
    )
  }
}

export default App
