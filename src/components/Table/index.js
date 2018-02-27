import React, { Component, PropTypes } from 'react'

class Table extends Component {
  constructor() {
    super()

    this.renderCell = this.renderCell.bind(this)
    this.renderRow = this.renderRow.bind(this)
    this.repaint = this.repaint.bind(this)
    this.decideColorFromNeighbourhood = this.decideColorFromNeighbourhood.bind(this)
    this.allCellsSameColor = this.allCellsSameColor.bind(this)
    this.getFirstPaintColorMap = this.getFirstPaintColorMap.bind(this)

    this.paintInterval = null
    this.firstPaint = null
    this.cellWidth = 64
    this.cellHeight = 64
    this.rowsAmount = null // Set in componentDidMount
    this.cellsPerRow = null // Set in componentDidMount
    this.colors = [ 'white', 'black' ]
    this.allCells = document.getElementsByTagName( 'td' )

    // Settings
    this.randomizeNewPaints = false

    this.state = {
      paintNum: 0,
      rows: null,
      allCellsSameColor: false
    }
  }

  componentDidMount() {
    // Compute number of rows and cells per row based on viewport width and height
    this.rowsAmount = Math.floor(window.innerHeight / this.cellHeight)
    this.cellsPerRow = Math.floor(window.innerWidth / this.cellWidth)

    this.renderRows(this.rowsAmount)
    this.paintInterval = setInterval( this.repaint, 100 )
  }

  componentWillUnmount() { clearInterval(this.paintInterval) }

  getFirstPaintColorMap() {
    let cellBackgrounds = []
    for ( let cell of this.allCells ) cellBackgrounds.push( cell.style.backgroundColor )
    return cellBackgrounds
  }

  repaint() {
    if ( this.state.paintNum == 0 ) this.firstPaint = this.getFirstPaintColorMap() // Save first paint for reuse if not randomizeNewPaints is on
    this.setState({
      paintNum: this.state.paintNum + 1,
      allCellsSameColor: this.allCellsSameColor()
    })
    this.renderRows(this.rowsAmount)
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
      backgroundColors[1] == color && backgroundColors[2] == color ||
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
