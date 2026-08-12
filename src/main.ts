 import * as opentype from 'opentype.js'
import { Renderer } from './renderer'
 
const response = await fetch('/Lekton-Bold.ttf')
const buffer = await response.arrayBuffer()
const font = opentype.parse(buffer)

void new Renderer(font)
