import { G, Rect } from "@svgdotjs/svg.js";
import type { Renderer } from "./renderer";
import { range } from "./math";
import { borderColor, gridSize, highlightColor } from "./parameters";

export class Grid {
  renderer: Renderer
  group: G
  tiles: Rect[][] = []
  highlights: Rect[][] = []

  constructor (renderer: Renderer) {
    this.renderer = renderer
    this.group = renderer.svg.group()
    range(gridSize).forEach(x => {
      this.tiles[x] = []
      this.highlights[x] = []
      range(gridSize).forEach(y => {
        const highlight = this.group.rect(1, 1).center(x, y)
        highlight.stroke({
          color: highlightColor,
          width: 0.07,
          linecap: 'square'
        })
        highlight.fill('none')
        highlight.opacity(0)
        this.highlights[x][y] = highlight
        const tile = this.group.rect(1, 1).center(x, y)
        tile.stroke({ color: borderColor, width: 0.05 })
        tile.fill('none')
        this.tiles[x][y] = tile
      })
    })
  }
}