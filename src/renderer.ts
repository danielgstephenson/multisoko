import { SVG } from '@svgdotjs/svg.js'
import * as opentype from 'opentype.js'

export class Renderer {
  font: opentype.Font
  svg = SVG().addTo('#svgDiv')
  setupComplete = false

  constructor (font: opentype.Font) {
    this.font = font
    this.onResize()
    window.addEventListener('resize', () => this.onResize())
  }

  onResize (): void {
    const vmin = Math.min(window.innerWidth, window.innerHeight)
    const scale = 1
    this.svg.size(scale * vmin, scale * vmin)
    const direction = window.innerWidth < window.innerHeight ? 'column' : 'row'
    this.svgDiv.style.flexDirection = direction
  }

}