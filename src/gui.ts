import { SVG} from '@svgdotjs/svg.js'
import * as opentype from 'opentype.js'
import { gridSize } from './parameters'
import { Grid } from './grid'

export class GUI {
  font: opentype.Font
  svgDiv = document.getElementById('svgDiv') as HTMLDivElement
  svg = SVG().addTo('#svgDiv')
  padding = 1.25
  grid: Grid

  constructor (font: opentype.Font) {
    this.font = font
    this.onResize()
    window.addEventListener('resize', () => this.onResize())
    this.setup()
    this.grid = new Grid(this) 
  }

  setup() {
    const x = -0.5 - this.padding
    const y = -0.5 - this.padding
    const width = gridSize + 2 * this.padding
    const height = gridSize + 2 * this.padding
    this.svg.flip('y')
    this.svg.viewbox(x, y, width, height)
  }

  onResize (): void {
    const vmin = Math.min(window.innerWidth, window.innerHeight)
    const scale = 1
    this.svg.size(scale * vmin, scale * vmin)
    const direction = window.innerWidth < window.innerHeight ? 'column' : 'row'
    this.svgDiv.style.flexDirection = direction
  }

}