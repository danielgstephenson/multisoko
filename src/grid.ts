import { G } from "@svgdotjs/svg.js";
import type { Renderer } from "./renderer";

export class Grid {
  renderer: Renderer
  group: G

  constructor (renderer: Renderer) {
    this.renderer = renderer
    this.group = renderer.svg.group()
  }
}