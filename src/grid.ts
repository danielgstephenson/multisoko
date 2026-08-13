import { G, Rect } from "@svgdotjs/svg.js";
import type { GUI } from "./gui";
import { range } from "./math";
import { borderColor, endInterval, getPosition, goalColor, goals, gridSize, highlightColor, maxRound, teamColors, tieColor, unitCount } from "./parameters";
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
    this.updateOutRect()
    this.updateGoals()
  }

  updateOutRect(): void {
    if(this.game.phase !== 'end') {
      this.outRect.stroke({color: borderColor})
      this.outRect.attr('stroke-dasharray','')
      return
    }
    let mapColor = tieColor
    if (this.game.winner === 0) mapColor = teamColors[0]
    if (this.game.winner === 1) mapColor = teamColors[1]
    this.outRect.stroke({color: mapColor})
    const sideLength = this.outRect.bbox().width
    const perimeter = 4 * sideLength
    const a = perimeter * this.game.countdown / endInterval
    const b = perimeter - a
    this.outRect.attr('stroke-dasharray', `${a} ${b}`)
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

  updateGoals(): void {
    goals.forEach((loc,i) => {
      const position = getPosition(loc, this.gui.angle)
      this.goalGroups[i].transform({
        translateX: position.x,
        translateY: position.y
      })
    })
    if(this.game.phase === 'end') return
    this.goalRects.forEach(goalRect => {
      const sideLength = goalRect.bbox().width
      const perimeter = 4 * sideLength
      const b = perimeter * (this.game.round - 1) / maxRound
      const a = perimeter - b
      goalRect.attr('stroke-dasharray', `${a} ${b}`)
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