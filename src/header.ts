import type { Path, Rect } from "@svgdotjs/svg.js";
import type { GUI } from "./gui";
import { highlightColor, labelColor, teamColors } from "./parameters";
import { range } from "./math";
import type { Game } from "./game";

export class Header {
  gui: GUI
  game: Game
  font: opentype.Font
  levelLabel: Path
  flags: Rect[] = []
  teamArrows: Path[] = []

  constructor (gui: GUI) {
    this.gui = gui
    this.game = this.gui.game
    this.font = this.game.font
    this.levelLabel = this.makeLevelLabel()
    this.updateLevelLabel(1)
    this.addFlags()
    this.addTeamArrows()
  }

  update(): void {
    this.updateTeamArrows()
    this.updateFlags()
  }

  updateFlags(): void {
    this.flags.forEach((flag, team) => {
      const playerTeamColor = teamColors[this.game.playerTeam]
      const fillColor = team === this.game.playerTeam ? playerTeamColor : 'black'
      const opacity = 1
      flag.opacity(opacity)
      flag.fill(fillColor)
    })
  }

  updateLevelLabel(level: number) {
    const text = `Level ${level.toFixed(0)}`
    const path = this.font.getPath(text, 0, 0, 0.5)
    this.levelLabel.attr({ d: path.toPathData(4) })
    this.levelLabel.fill(labelColor)
    const box = path.getBoundingBox()
    this.levelLabel.transform({
      translateX: +0.5 * (box.x1 - box.x2),
      translateY: +0.5 * (box.y2 - box.y1)
    })
  }

  updateTeamArrows(): void {
    if (this.game.phase !== 'team') {
      this.teamArrows.forEach(arrow => { arrow.opacity(0) })
      return
    }
    this.teamArrows.forEach(arrow => {
      arrow.opacity(0.5 + 0.5 * Math.sin(0.5 * this.game.tick))
    })
  }

  makeLevelLabel(): Path {
    const group = this.gui.svg.group()
    group.translate(2, 5.01)
    group.flip('y')
    const levelLabel = group.path()
    return levelLabel
  }

  addFlags(): void {
    const points = [
      [0.5, 5],
      [3.5, 5]
    ]
    points.forEach((point, team) => {
      const x = point[0]
      const y = point[1]
      const rect = this.gui.svg.rect(0.4, 0.4)
      rect.center(x, y)
      rect.stroke({
        color: teamColors[team],
        width: 0.1
      })
      this.flags.push(rect)
    })
  }

  addTeamArrows(): void {
    const marker = this.gui.svg.defs().marker(3, 3)
    marker.attr({
      id: 'arrowHead',
      viewBox: '0 0 10 10',
      refX: 5,
      refY: 5,
      orient: 'auto'
    })
    marker.path('M 0 0 L 10 5 L 0 10 z')
    marker.fill(highlightColor)
    range(2).forEach(i => {
      const x0 = 4 * Math.sign(i)
      const x1 = x0 + Math.sign(i - 0.5) * 0.5
      const arrow = this.gui.svg.path(`M ${x0},5 L ${x1},5`)
      arrow.fill('none')
      arrow.stroke({
        width: 0.1,
        color: highlightColor
      })
      arrow.marker('end', marker)
      this.teamArrows[i] = arrow
    })
  }
}