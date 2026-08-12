import { G, Rect } from "@svgdotjs/svg.js";
import type { GUI } from "./gui";
import { range } from "./math";
import { borderColor, gridSize, highlightColor } from "./parameters";

export class Grid {
  gui: GUI
  group: G
  tiles: Rect[][] = []
  highlights: Rect[][] = []
  outRect: Rect

  constructor (gui: GUI) {
    this.gui = gui
    this.group = gui.svg.group()
    this.addTiles()
    this.outRect = this.makeOutRect()
  }

  addTiles(): void {
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

  makeOutRect(): Rect {
    const gap = 0.25
    const width = gridSize + gap
    const height = gridSize + gap
    const center = 0.5 * (gridSize - 1)
    const outRect = this.gui.svg.rect(width, height)
    outRect.fill({ opacity: 0 })
    outRect.stroke({
      color: borderColor,
      width: 0.05,
      linecap: 'square'
    })
    outRect.center(center, center)
    return outRect
  }

}