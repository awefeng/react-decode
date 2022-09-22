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
 *
 */
function render(element, container){
  // 1. 生成一个dom来对应当前的element
  const dom = element.type === 'TEXT_ELEMENT' ? document.createTextNode('')  : document.createElement(element.type)
  // 2. 将element的props传给DOM
  Object.keys(element.props).filter(key => key!== 'children').forEach(key => {dom[key] = element.props[key]})
  // 3. 将DOM结构挂载到父DOM下
  container.appendChild(dom)
  // 4. 遍历children生成element对应的dom树
  element.props.children.forEach(child => render(child, dom))

}

export const Feact =  {
  createElement,
  render
}
