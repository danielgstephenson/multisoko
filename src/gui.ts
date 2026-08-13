import { SVG} from '@svgdotjs/svg.js'
import { gridSize, unitCount } from './parameters'
import { Grid } from './grid'
import { Header } from './header'
import type { Game } from './game'
import { Unit } from './unit'
import { range, type Vec2 } from './math'

export class GUI {
  game: Game
  svgDiv = document.getElementById('svgDiv') as HTMLDivElement
  svg = SVG().addTo('#svgDiv')
  angle = 0
  padding = 1.25
  grid: Grid
  header: Header
  units: Unit[] = []
  focus: Vec2 = {x: 0, y: 0}

  constructor (game: Game) {
    this.game = game
    this.onResize()
    window.addEventListener('resize', () => this.onResize())
    this.setup()
    this.grid = new Grid(this)
    this.header = new Header(this)
    range(unitCount).forEach(rank => new Unit(this, rank))
    this.updateFocus(0)
  }

  update(): void {
    this.header.update()
    this.grid.update()
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

  updateFocus (rank: number): void {
    const svgPoint = this.svg.node.createSVGPoint()
    svgPoint.x = 0
    svgPoint.y = 0
    const unitGroup = this.units[rank].group
    const unitElement = unitGroup.node
    const transform = unitElement.getScreenCTM()
    if (transform == null) return
    const screenPoint = svgPoint.matrixTransform(transform)
    this.focus.x = screenPoint.x
    this.focus.y = screenPoint.y
  }

}
