/**
 * 手写一个简单的React V2
 * 在v1的基础上添加concurrent mode
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
 * workLoop 支撑render2.0的concurrent mode函数
 * 暂时实现上通过requestIdleCallback实现
 * 在实际的scheduler模块中是通过一系列机制的结合实现
 */

let nextUnitWork = null // 下一次需要处理的工作单元

function workLoop(deadline){
  let shouldYield = false
  // 存在下一次工作单元并且此时不需要中断的时候，就继续执行
  while(nextUnitWork && !shouldYield){
    console.log("重新启动")
    // 1. performUnitWork工作：处理当前的工作单元，并且返回下一次需要处理的工作单元
    nextUnitWork = performUnitWork(nextUnitWork)
    // 2. 判断是否需要中断
    shouldYield = deadline.timeRemaining < 1
  }
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

/**
 * performUnitWork怎么处理当前的工作单元：需要完成v1.0render的工作
 * 1. 创建一个dom
 * 2. 将element的props传给DOM
 * 3. 将DOM结构挂载在父DOM下
 * 4. 用"返回下一个工作单元"的方式来代替遍历
 *
 * 还需要做一个额外的工作，建立各个fiber之间的关系
 *
 * @param {*} fiber
 * 因此nextUnitWork需要有以下属性
 * {
 *   dom: 用于表示nextUnitWork代表的element所对应的DOM结构,
 *   props: element的属性，创建dom的时候需要
 *   type: element的type，创建dom的时候需要
 *   parent: 父DOM
 * }
 * 这个结构就叫做fiber
 * 目前fiber的两层含义：工作单元、数据结构
 */
function performUnitWork(fiber){
  // 1+2. 创建一个dom并挂载props
  if(!fiber.dom){
    fiber.dom = createDOM(fiber)
  }
  // 3. DOM结构挂载在父DOM下
  if(fiber.parent){
    fiber.parent.dom.appendChild(fiber.dom)
  }

  // 4. 找到下一个需要处理的element并生成fiber返回
  // 如何寻找下一个需要处理的element：这种算法需要将element树的所有节点都遍历到，则候选为DFS和BFS。
  // 采用DFS的一个可能原因是子节点遍历完以后马上就能找到对应的父节点
  const childElements = fiber.props ? fiber.props.children : []
  let index = 0
  let preSiblingFiber = null

  // 处理new map那种写法
  childElements.forEach((_, index) => {
    if(Array.isArray(childElements[index])){
      childElements[index] = {type: 'div', props: {children: childElements[index]} }
    }
  })
  // 遍历子element，产生子fibers，并建立他们之间的关系
  while(index < childElements.length){
    const newFiber = {
      dom: null,
      props: childElements[index].props,
      type: childElements[index].type,
      parent: fiber
    }
    // 第一个子fiber
    if(index === 0){
      fiber.child = newFiber
    }else{
      preSiblingFiber.sibling = newFiber
    }
    preSiblingFiber = newFiber
    index++
  }

  // 返回下一个需要处理的fiber
  if(fiber.child){
    return fiber.child
  }
  let nextFiber = fiber
  while(nextFiber){
    if(nextFiber.sibling) return nextFiber.sibling
    nextFiber = nextFiber.parent
  }
  // 后面可以不要
  // 如果nexFiber遍历到最初的initFiber以后，证明已经没有需要处理的fiber了
  return null
}

/**
 * 将通过fiber创建DOM这一步骤抽成一个函数
 */
function createDOM(fiber){
  const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode('')  : document.createElement(fiber.type)
  fiber.props && Object.keys(fiber.props).filter(key => key !== "children").forEach(key => dom[key] = fiber.props[key])
  return dom
}
/**
 * render
 * v2.0：通过concurrent mode来实现可中断更新
 *
 * v1.0问题：
 * children.forEach(child => render(child,dom))是一个不可中断的递归遍历，每次必须执行完以后再去更新dom
 * 如果传入render的element对象结构很深会导致递归的时间很长
 * @param {*} element
 * @param {*} container
 */
function render(element, container){
  // workLoop 一直在轮询，因此只需要将nextUnitWork赋值为初始的fiber就可启动
  const initFiber =
  {
    dom: container,
    props: {
      children: [element]
    }
  }
  nextUnitWork = initFiber
}

export const Feact =  {
  createElement,
  render
}
