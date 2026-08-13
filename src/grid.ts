import { G, Rect } from "@svgdotjs/svg.js";
import type { GUI } from "./gui";
import { range } from "./math";
import { borderColor, getPosition, goalColor, goals, gridSize, highlightColor, teamColors, tieColor, unitCount } from "./parameters";
import type { Game } from "./game";
import { stateToLocs } from "./state";

export class Grid {
  game: Game
  gui: GUI
  group: G
  tiles: Rect[][] = []
  highlights: Rect[][] = []
  goalRects: Rect[] = []
  goalGroups: G[] = []
  outRect: Rect

  constructor (gui: GUI) {
    this.gui = gui
    this.game = this.gui.game
    this.group = gui.svg.group()
    this.addTiles()
    this.outRect = this.makeOutRect()
    this.addGoals()
  }

  update(): void {
    this.updateHighlights()
    this.updateTiles()
  }

  updateTiles(): void {
    const scores = this.game.getScores()
    let mapColor = borderColor
    if(this.game.phase==='end') {
      mapColor = tieColor
      if (scores[0] === 2) mapColor = teamColors[0]
      if (scores[1] === 2) mapColor = teamColors[1]
    } else {
      this.outRect.attr('stroke-dasharray','')
    }
    this.outRect.stroke({color: mapColor})
    this.tiles.flat().forEach(tile => {
      tile.stroke({color: mapColor})
    })
  }

  updateHighlights(): void {
    this.clearHighlights()
    const unitLocs = stateToLocs(this.game.state)
    const activeTeam = this.game.round % 2
    range(unitCount).forEach(i => {
      const loc = unitLocs[i]
      const position = getPosition(loc, this.gui.angle)
      const highlight = this.highlights[position.x][position.y]
      if (i !== 0 || this.game.phase !== 'choice') {
        return
      }
      highlight.front()
      const alpha = activeTeam === this.game.playerTeam ? 0.7 : 0.3
      highlight.opacity(alpha)
    })
  }

  clearHighlights(): void {
    this.highlights.flat().forEach(highlight => {
      highlight.opacity(0)
    })
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

  addGoals(): void {
    this.goalGroups = []
    goals.forEach(loc => {
      const position = getPosition(loc, this.gui.angle)
      const goalGroup = this.gui.svg.group().transform({
        translateX: position.x,
        translateY: position.y
      })
      this.goalGroups.push(goalGroup)
      const rect = goalGroup.rect(0.9, 0.9).center(0, 0)
      rect.fill({
        color: goalColor,
        opacity: 0.2
      })
      rect.stroke({
        color:goalColor,
        width: 0.05,
        opacity: 1
      })
      this.goalRects.push(rect)
    })
  }

}