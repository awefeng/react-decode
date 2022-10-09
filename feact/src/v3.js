/**
 * 手写一个简单的React V3
 * 在v2的基础上新增阶段区分 新增更新和删除fiber的处理
 */
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child => typeof child === 'object' ? child : createTextElement(child))
    }
  }
}

function createTextElement(child) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: child,
      children: []
    }
  }
}

// 改造createDOM以支持事件
function createDOM(fiber) {

  const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(fiber.type)

  if(fiber.props){
    updateDom(dom, {}, fiber.props)
  }
  return dom
}


const isEvent = key => key.startsWith("on")
const isProperty = key =>
  key !== "children" && !isEvent(key)
const isNew = (prev, next) => key =>
  prev[key] !== next[key]
const isGone = (prev, next) => key => !(key in next)

/**
 * updateDom: 创建或者更新DOM的时候使用
 */
function updateDom(dom, prevProps, nextProps) {
  //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(
      key =>
        !(key in nextProps) ||
        isNew(prevProps, nextProps)(key)
    )
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.removeEventListener(
        eventType,
        prevProps[name]
      )
    })

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      dom[name] = ""
    })
  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      dom[name] = nextProps[name]
    })

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.addEventListener(
        eventType,
        nextProps[name]
      )
    })
}


let nextUnitWork = null // 下一次需要处理的工作单元
let workInProgressRoot = null // 正在进行的更新中，生成的fiber树的根节点
let currentRoot = null // 上一次更新中，生成的fiber树的根节点
let needDeleteFibers = [] // 保存在对比以后需要删除的旧的fiber节点

const EFFECTTAGS = {
  placement: "PLACEMENT",
  update: "UPDATE",
  deletion: "DELETION"
}

function workLoop(deadline) {
  let shouldYield = false
  // 存在下一次工作单元并且此时不需要中断的时候，就继续执行
  while (nextUnitWork && !shouldYield) {
    console.log("重新启动")
    // 1. performUnitWork工作：处理当前的工作单元，并且返回下一次需要处理的工作单元
    nextUnitWork = performUnitWork(nextUnitWork)
    // 2. 判断是否需要中断
    shouldYield = deadline.timeRemaining < 1
  }
  // 如果这次更新没有需要处理的fiber工作单元了 并且有准备更新的fiber树的根节点
  if (!nextUnitWork && workInProgressRoot) {
    commitRoot()
  }
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

/**
 * commit阶段入口
 */
function commitRoot() {
  // 删除不要的DOM
  needDeleteFibers.forEach(commitWork)
  commitWork(workInProgressRoot.child)
  // 更新完以后将workInProgressRoot保存为currentRoot
  currentRoot = workInProgressRoot
  workInProgressRoot = null
}

/**
 * commit阶段：处理fiber树 进行挂载DOM
 */
function commitWork(fiber) {
  // 处理叶子节点的child和sibling为空的情况
  if (!fiber) return
  // 继续按照DFS的方式挂载DOM
  const parentDOM = fiber.parent.dom
  // 旧的fiber 删除DOM也是render阶段，也放在commitWork处理
  if (fiber.effectTag === EFFECTTAGS.deletion) { parentDOM.removeChild(fiber.dom) }
  else if (fiber.effectTag === EFFECTTAGS.placement) {
    parentDOM.appendChild(fiber.dom)
  }
  else if (fiber.effectTag === EFFECTTAGS.update) {
    updateDom(
      fiber.dom,
      fiber.alternate.props,
      fiber.props
    )
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

/**
 * 在v2的基础上
 * 将挂载DOM单独抽到完成fiber树以后
 * 将处理当前fiber的后代 生成后代fiber的逻辑单独写成函数reconcileChildren
 *
 * 并且将reconcileChildren中的处理逻辑支持更新和删除
 */
function performUnitWork(fiber) {
  // 1+2. 创建一个dom并挂载props
  if (!fiber.dom) {
    fiber.dom = createDOM(fiber)
  }
  // // 3. DOM结构挂载在父DOM下
  // if(fiber.parent){
  //   fiber.parent.dom.appendChild(fiber.dom)
  // }
  reconcileChildren(fiber)

  // 返回下一个需要处理的fiber
  if (fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling
    nextFiber = nextFiber.parent
  }
  return null
}

/**
 * 作用：处理workInPorgress树中的fiber节点的后代节点 生成后代fibers
 * 找到传入的参数fiber的原来的后代节点，进行对比
 */
function reconcileChildren(fiber) {
  const childElements = fiber.props ? fiber.props.children : []
  // 找到当前参数的fiber对应的旧的fiber的child 第一个子节点
  let oldFiber = fiber.alternate && fiber.alternate.child
  let index = 0
  let preSiblingFiber = null

  // 处理new map那种写法
  childElements.forEach((_, index) => {
    if (Array.isArray(childElements[index])) {
      childElements[index] = { type: 'div', props: { children: childElements[index] } }
    }
  })
  // 遍历子element，产生子fibers，并建立他们之间的关系
  // 删除的时候会有：oldFiber !== null + 新的elements不存在 这种情况
  while (index < childElements.length || oldFiber) {
    let newFiber = null
    // 原来有旧的节点 进行对比
    if (oldFiber) {
      // 原来有 新的没有 删除的情况
      if (index >= childElements.length) {
        // 单独用一个队列来保存需要删除的原来的fiber 不要影响新的fiber树
        oldFiber.effectTag = EFFECTTAGS.deletion
        needDeleteFibers.push(oldFiber)
      } else { // 原来有 新的也有  替换或者是复用的情况
        // 复用
        if (oldFiber.type === childElements[index].type) {
          newFiber = {
            dom: oldFiber.dom,
            props: childElements[index].props,
            type: childElements[index].type,
            parent: fiber,
            alternate: oldFiber,
            effectTag: EFFECTTAGS.update
          }
        } else {
          // 替换：删除旧的 迎接新的
          newFiber = {
            dom: null,
            props: childElements[index].props,
            type: childElements[index].type,
            parent: fiber,
            alternate: oldFiber,
            effectTag: EFFECTTAGS.update
          }
        }
      }

    } else { // 原来这里没有旧的节点 则是新增的情况
      newFiber = {
        dom: null,
        props: childElements[index].props,
        type: childElements[index].type,
        parent: fiber,
        alternate: null,
        effectTag: EFFECTTAGS.placement
      }
    }
    // 遍历完一轮 oldFiber就需要指向下一个 确保要生成的newFiber和正确的旧的fiber进行对比
    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    // 第一个子fiber
    if (index === 0) {
      fiber.child = newFiber
    } else {
      preSiblingFiber.sibling = newFiber
    }
    preSiblingFiber = newFiber
    index++
  }
}

function render(element, container) {
  // workLoop 一直在轮询，因此只需要将nextUnitWork赋值为初始的fiber就可启动
  const initFiber =
  {
    dom: container,
    props: {
      children: [element]
    },
    alternate: currentRoot
  }
  workInProgressRoot = initFiber
  nextUnitWork = initFiber
}

export const Feact = {
  createElement,
  render
}
