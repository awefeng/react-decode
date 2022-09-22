import {Feact} from './v1'

/** @jsxRuntime classic */
/** @jsx Feact.createElement */
const element = (
  <div style="background: red">
    <h1>测试crateElement</h1>
    <h2 style="text-align:right">Feact</h2>
  </div>
)

const container = document.getElementById("root")
Feact.render(element, container)
