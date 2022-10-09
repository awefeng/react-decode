import { Feact } from './v3'

/** @jsxRuntime classic */
/** @jsx Feact.createElement */
// const element = (
//   <div style="background: red">
//     {new Array(1000).fill("").map((_, index) => <span key={index}>第{index+1}个</span>)}
//     <span>测试element1</span>
//     <span>测试element1</span>
//     <span>测试element1</span>
//     <span>测试element1</span>
//     <span>测试element1</span>
//     <span>测试element1</span>
//     <span>测试element1</span>
//     <span>测试element1</span>
//     <span>测试element1</span>
//   </div>
// )

const reRender = (value) => {
  return ( <div>
    <input onInput={updateValue} value={value} />
    <h2>Hello {value}</h2>
  </div>
  )
}

const updateValue = (e) =>{
  Feact.render(reRender(e.target.value), container)
}

const container = document.getElementById("root")
Feact.render(reRender('awefeng'), container)
