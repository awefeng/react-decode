
function FiberNode(
  tag: WorkTag,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode,
) {

  // 作为React Element
  // Fiber节点对应的React element的类型 见 ReactWorkTags.js
  this.tag = tag;
  // key属性
  this.key = key;
  // 大部分情况同type，某些情况不同，比如FunctionComponent使用React.memo包裹
  this.elementType = null;
  // 对于 FunctionComponent，指函数本身，对于ClassComponent，指class，对于HostComponent，指DOM节点tagName
  this.type = null;
  // Fiber对应的真实DOM节点
  this.stateNode = null;

  // 作为fiber节点 数据结构
  // 指向父fiber
  this.return = null;
  // 指向子fiber
  this.child = null;
  // 指向下一个兄弟fiber
  this.sibling = null;
  this.index = 0;

  // ref属性
  this.ref = null;

  // 本次更新造成的改变
  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.updateQueue = null;
  this.memoizedState = null;
  this.dependencies = null;

  this.mode = mode;

  // 本次更新的副作用 决定本次更新需要做的动作
  this.flags = NoFlags;
  this.subtreeFlags = NoFlags;
  this.deletions = null;

  // 优先级
  this.lanes = NoLanes;
  this.childLanes = NoLanes;

  //
  this.alternate = null;

}
