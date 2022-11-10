### Fiber三层含义

1. 作为架构：React15是利用栈的递归更新，为stack reconciler；React16以后采用的是fiber节点的链表，为fiber reconciler

2. 作为数据结构：fiber节点代表一个react element，保存着自己的父fiber、子fiber、兄弟fiber等关系，以及保存组件的类型、对应的DOM信息等。

3. 作为工作单元：保存着本次更新中该react element改变的状态，以及需要执行的工作（插入、更新、删除等）。


### 双缓存

清除当前页面 -> 绘制下一帧内容 -> 显示下一帧页面
优化：减少上一帧到下一帧的时间
在内存中提前绘制好下一帧内容 -> 清除当前页面 -> 显示下一帧页面   

current fiber : 当前显示画面对应的fiber树
workInProgress fiber: 内存中下一帧对应的fiber树

currentFiber.alternate = workInProgressFiber
workInProgressFiber.alternate = currentFiber


### fiberRootNode 和 rootFiber
fiberRootNode: 整个应用唯一的根节点
rootFiber: 每一个react.render对应的根节点（rootFiber节点的children就是<APP /> 具体代码JSX了）

一个工程中可能有多个render函数，就会对应多个rootFiber节点，但是整个工程中只会有一个fiberRootNode

fiberRootNode --children--> rootFiber --children--> App

### mount/update下的beginWork completeWork
项目启动初始化的时候，就会创建fiberRootNode和rootFiber两个节点

从最开始的fiberRootNode开始，
然后在最开始mount的时候，currentFiber树中rootFiber下的fiber节点都为空，workInProgressFiber树中rootFiber下为APP fiber节点。

### beginWork的工作

beignWork的工作就是拿到当前的current Fiber节点, 计算出他的children fiber（所有子节点），和需要更新的JSX（Element），计算出新的子fiber节点，并将新的子fiber节点挂载到workInProgress.child上

其中会涉及到是否能够复用原来的Fiber的子节点，如果能够复用，则clone原来current Fiber的子节点


