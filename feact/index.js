/**
 * 手写一个简单的React
 * https://pomb.us/build-your-own-react/
 */

/**
 * const element = <h1 title="foo">Hello</h1>
 * const container = document.getElementById("root")
 * ReactDOM.render(element, container)
 * 需要实现两个核心功能：
 * 第一个是实现createElement函数将JSX转换为JS对象，
 * 第二个是实现render函数，将JSX转换后生成的JS对象渲染到DOM上
 * render函数的作用: 用JSX通过createElement生成的JS对象，生成对应的DOM结构，挂载到container
 */
/**
 * JSX转换为JS的过程: 递归遍历JSX结构
 * 在执行createElement时，如果有children，先判断children类型。
 * child的类型为object的时候执行createElement(child)，拿到child的转换结果后再继续运行。
 */
function createElement(type, props, ...children){
  return {
    type,
    props: {
      ...props,
      children: children.map(child => typeof child === 'object' ? child : createTextElement(child))
    }
  }
}

/**
 * JSX是文本节点的时候单独处理
 * @param {string} child
 */
function createTextElement(child){
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: child,
      children: []
    }
  }
}


/**
 * render
 * v1.0：简单的创建一个dom，附上props，挂载到container
 *
 * 注意此时render的element参数已经是转换后的JS对象。
 * @param {*} element
 * @param {*} container
function render(element, container){
  // 1. 生成一个dom来对应当前的element
  const dom = element.type === 'TEXT_ELEMENT' ? document.createTextNode('')  : document.createElement(element.type)
  // 2. 将element的props传给DOM
  Object.keys(element.props).filter(key => key!== 'children').forEach(key => {dom[key] = element.props[kye]})

  // 3. 遍历children生成element对应的dom树  v1.0
  // element.props.children.forEach(child => render(child, dom))

  container.appendChild(dom)
}
*/

/**
 * workLoop 支撑render2.0的concurrent mode函数
 * 暂时实现上通过requestIdleCallback实现
 * 在实际的scheduler模块中是通过一系列机制的结合实现
 */

let nextUnitWork = null // 下一次需要处理的工作单元

function workLoop(deadline){
  let shouldYield = false
  // 存在下一次工作单元并且此时不需要中断的时候，就继续执行
  while(nextUnitWork && !shouldYield){
    // 1. performUnitWork工作：处理当前的工作单元，并且返回下一次需要处理的工作单元
    nextUnitWork = performUnitWork(nextUnitWork)
    // 2. 判断是否需要中断
    shouldYield = deadline.timeRemaining < 1
  }
}

requestIdleCallback(workLoop)

/**
 * performUnitWork怎么处理当前的工作单元：
 * performUnitWork需要完成v1.0render的工作，创建一个dom，并附与props，用返回下一个工作单元的方式来代替遍历
 *
 * @param {*} nextUnitWork
 */
function performUnitWork(nextUnitWork){

}
/**
 * render
 * v2.0：通过concurrent mode来实现可中断更新
 *
 * v1.0问题：
 * children.forEach(child => render(child,dom))是一个不可中断的递归遍历，每次必须执行完以后再去更新dom
 * 如果传入render的element对象结构非DOM结构非常神
 * @param {*} element
 * @param {*} container
 */
function render(element, container){
  //1. 首先
}

const Feact =  {
  createElement,
  render
}
