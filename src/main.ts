 import * as opentype from 'opentype.js'
import { GUI } from './gui'
 
const response = await fetch('/Lekton-Bold.ttf')
const buffer = await response.arrayBuffer()
const font = opentype.parse(buffer)

void new GUI(font)
