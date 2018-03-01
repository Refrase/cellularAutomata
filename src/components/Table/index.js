import React, { Component, PropTypes } from 'react'

class Table extends Component {
  constructor() {
    super()

    // Settings
    this.cellWidth = 48
    this.cellHeight = 48
    this.framesPerSecond = 8
    this.colors = [ 'white', 'black' ]
    this.randomizeNewPaints = false
    // --------

    this.renderCell = this.renderCell.bind(this)
    this.renderRow = this.renderRow.bind(this)
    this.paint = this.paint.bind(this)
    this.decideColorFromNeighbourhood = this.decideColorFromNeighbourhood.bind(this)
    this.allCellsSameColor = this.allCellsSameColor.bind(this)
    this.getFirstPaintColorMap = this.getFirstPaintColorMap.bind(this)

    this.firstPaint = null
    this.cellsPerRow = Math.floor(window.innerWidth / this.cellWidth)  // Compute number of cells per row based on viewport width
    this.rowsAmount = Math.floor(window.innerHeight / this.cellHeight) // Compute number of rows based on viewport height
    this.allCells = document.getElementsByTagName( 'td' )
    this.then = null
    this.fpsInterval = 1000 / this.framesPerSecond

    this.state = {
      paintNum: 0,
      rows: null,
      allCellsSameColor: false
    }
  }

  componentDidMount() {
    this.renderRows(this.rowsAmount)
    this.then = Date.now()
    setTimeout( this.paint, 0 ) // Ensuring that paint is pushed to next call stack tick so that DOM elements are available
  }

  getFirstPaintColorMap() {
    let cellBackgrounds = []
    for ( let cell of this.allCells ) cellBackgrounds.push( cell.style.backgroundColor )
    return cellBackgrounds
  }

  paint() {

    requestAnimationFrame(this.paint) // Request another frame

    // ##### Time controlling first part of function (the animation speed is set at this.framesPerSecond)
    // Calc elapsed time since last loop
    const now = Date.now();
    const elapsed = now - this.then;
    if (elapsed > this.fpsInterval) { // If enough time has elapsed, draw the next frame
      // Get ready for next frame by setting then = now, but also adjust for the specified fpsInterval not being a multiple of requestAnimationFrame's interval (16.7ms)
      this.then = now - ( elapsed % this.fpsInterval )

      // ##### The actual painting
      if ( this.state.paintNum == 0 ) this.firstPaint = this.getFirstPaintColorMap() // Save first paint for reuse if not randomizeNewPaints is on
      this.setState({
        paintNum: this.state.paintNum + 1,
        allCellsSameColor: this.allCellsSameColor() // Check if all cells are same color. If they are loop animation from the "color map" saved in this.firstPaint
      })
      this.renderRows(this.rowsAmount)

    }

  }

  allCellsSameColor() { // Detect when all cells are same color for triggering a repaint of cells
    let previousCellColor = document.getElementById( 'row-1-cell-1' ).style.backgroundColor // Initially set to first cell
    for (let i = 1; i < this.allCells.length + 1; i++) {
      if (i === this.allCells.length) return true
      if (previousCellColor != this.allCells[i].style.backgroundColor) {
        previousCellColor = this.allCells[i].style.backgroundColor
        return false
      }
    }
  }

  decideColorFromNeighbourhood(cellIndex, rowIndex, color) {

    const topLeftCell = document.getElementById( `row-${rowIndex - 1}-cell-${cellIndex - 1}` )
    const topCell = document.getElementById( `row-${rowIndex - 1}-cell-${cellIndex}` )
    const topRightCell = document.getElementById( `row-${rowIndex - 1}-cell-${cellIndex + 1}` )
    const leftCell = document.getElementById( `row-${rowIndex}-cell-${cellIndex - 1}` )
    const rightCell = document.getElementById( `row-${rowIndex}-cell-${cellIndex + 1}` )
    const bottomLeftCell = document.getElementById( `row-${rowIndex + 1}-cell-${cellIndex - 1}` )
    const bottomCell = document.getElementById( `row-${rowIndex + 1}-cell-${cellIndex}` )
    const bottomRightCell = document.getElementById( `row-${rowIndex + 1}-cell-${cellIndex + 1}` )

    const backgroundColors = []
    if (topLeftCell) backgroundColors.push(topLeftCell.style.backgroundColor); else backgroundColors.push('')
    if (topCell) backgroundColors.push(topCell.style.backgroundColor); else backgroundColors.push('')
    if (topRightCell) backgroundColors.push(topRightCell.style.backgroundColor); else backgroundColors.push('')
    if (leftCell) backgroundColors.push(leftCell.style.backgroundColor); else backgroundColors.push('')
    if (rightCell) backgroundColors.push(rightCell.style.backgroundColor); else backgroundColors.push('')
    if (bottomLeftCell) backgroundColors.push(bottomLeftCell.style.backgroundColor); else backgroundColors.push('')
    if (bottomCell) backgroundColors.push(bottomCell.style.backgroundColor); else backgroundColors.push('')
    if (bottomRightCell) backgroundColors.push(bottomRightCell.style.backgroundColor); else backgroundColors.push('')

    // This is the rules that directs the color of the cell based on neighbourhood cells
    if (
      backgroundColors[1] == color && backgroundColors[7] == color ||
      backgroundColors[3] == color && backgroundColors[7] == color ||
      backgroundColors[4] == color && backgroundColors[5] == color && backgroundColors[6] == color
    ) {
      return this.colors[1]
    } else {
      return this.colors[0]
    }

  }

  renderCell(cellIndex, rowIndex) {

    let backgroundColor

    if ( this.state.paintNum == 0 || this.state.allCellsSameColor && this.randomizeNewPaints ) {
      backgroundColor = this.colors[Math.round(Math.random())]
    } else if ( this.state.allCellsSameColor ) { // Copy the first random state on new paint (essentially looping the whole thing)
      const cellOverallIndex = (rowIndex + 1) * this.cellsPerRow - this.cellsPerRow + (cellIndex + 1)
      backgroundColor = this.firstPaint[cellOverallIndex]
    } else {
      backgroundColor = this.decideColorFromNeighbourhood(cellIndex, rowIndex, this.colors[1])
    }

    const id = `row-${rowIndex}-cell-${cellIndex}`
    const cellStyle = {
      backgroundColor: backgroundColor,
      display: 'inline-block',
      width: this.cellWidth,
      height: this.cellHeight
    }
    return <td style={cellStyle} key={id} id={id} />

  }

  renderRow(rowIndex) {
    const id = `row-${rowIndex}`
    let cells = []
    for ( let i = 0; i < this.cellsPerRow; i++ ) cells.push( this.renderCell(i, rowIndex) )
    return <tr key={id} id={id} style={{ display: 'block' }}>{ cells }</tr>
  }

  renderRows(rowsAmount) {
    let rows = []
    for ( let i = 0; i < rowsAmount; i++ ) rows.push( this.renderRow(i) )
    this.setState({ rows: rows })
  }

  render() {
    return(
      <table style={{ borderCollapse: 'collapse' }}>
        <thead></thead>
        <tbody>
          { this.state.rows }
        </tbody>
      </table>
    )
  }

}

export default Table
