import { Feact } from './v2'

/** @jsxRuntime classic */
/** @jsx Feact.createElement */
const element = (
  <div style="background: red">
    {new Array(1000).fill("").map((_, index) => <span key={index}>第{index+1}个</span>)}
    <span>测试element1</span>
    <span>测试element1</span>
    <span>测试element1</span>
    <span>测试element1</span>
    <span>测试element1</span>
    <span>测试element1</span>
    <span>测试element1</span>
    <span>测试element1</span>
    <span>测试element1</span>
  </div>
)

const container = document.getElementById("root")
Feact.render(element, container)
