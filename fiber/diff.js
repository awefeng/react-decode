// 数组的时候diff
function reconcileChildrenArray(
  returnFiber,
  currentFirstChild,
  newChildren,
) {
  let resultingFirstChild = null // diff完成以后生成的fiber链的第一个newFiber
  let previousNewFiber = null // 临时保存生成的fiber链的最后一个newFiber
  let oldFiber = currentFirstChild // 临时保存旧的fiber链中正需要处理的那一个fiber
  let lastPlacedIndex = 0 // 旧的fiber链，处理到的最大索引
  let newIdx = 0 // newChild，处理到的最大索引
  let nextOldFiber = null // 临时保存旧的fiber链中下一次需要处理的那一个fiber

  // 第一轮循环  处理newChild和oldFiber的key相同的情况 直到遇见第一个newChild和oldFiber的key值不同的情况马上跳出循环
  for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
    // 处理nextOldFiber 同时保证oldfiber的index和newChildren的newIdx能对上
    if (oldFiber.index > newIdx) {
      nextOldFiber = oldFiber
      oldFiber = null
    } else {
      nextOldFiber = oldFiber.sibling
    }
    // 更新fiber  旧fiber和newChild如果key值不同 newFiber会返回null
    const newFiber = updateSlot(
      returnFiber,
      oldFiber,
      newChildren[newIdx],
    )
    // 如果key值不同 则不能复用 第一阶段的结束
    if (newFiber === null) {
      if (oldFiber === null) {
        oldFiber = nextOldFiber
      }
      break
    }
    // 找到当前旧的fiber链中key相同的最大索引值
    lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
    // 处理保存上一个newFiber 下一个oldFi
    if (previousNewFiber === null) {
      resultingFirstChild = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }
    previousNewFiber = newFiber;
    oldFiber = nextOldFiber;
  }

  // 如果newChildren已经遍历完了 意味着newChildren每个都处理完了 则diif完成 剩下的oldfiber都不需要遍历了
  // 删除剩下的旧的fiber return resultingFirstChild diff结束
  if (newIdx === newChildren.length) {
    deleteRemainingChildren(returnFiber, oldFiber);
    return resultingFirstChild;
  }
  //  如果旧fiber都已经遍历完成 意味着旧fiber每个节点都复用了
  if (oldFiber === null) {
    // newIdx后面的节点都进行新增 新增完return resultingFirstChild diff结束
    for (; newIdx < newChildren.length; newIdx++) {
      const newFiber = createChild(returnFiber, newChildren[newIdx]);
      if (newFiber === null) {
        continue;
      }
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
    }
    return resultingFirstChild;
  }

  // 从链表变为map方便后续查找
  // Add all children to a key map for quick lookups.
  const existingChildren = mapRemainingChildren(returnFiber, oldFiber);

  // Keep scanning and use the map to restore deleted items as moves.
  // newChild和oldfiber都没有遍历完的情况
  for (; newIdx < newChildren.length; newIdx++) {
    // 生成新的newFiber
    const newFiber = updateFromMap(
      existingChildren,
      returnFiber,
      newIdx,
      newChildren[newIdx],
    )
    // 一般情况下不会为null，只是updateFromMap保险起见返回了个兜底值null
    if (newFiber !== null) {
      if (shouldTrackSideEffects) {
        if (newFiber.alternate !== null) {
          // 如果existingChildren存在key值或者newIdx相同的 则表示有复用 删除复用的节点
          existingChildren.delete(
            newFiber.key === null ? newIdx : newFiber.key,
          )
        }
      }
      // 继续更新当前旧的fiber链中处理了的最大索引值
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
    }
  }
  // 处理完不同
  if (shouldTrackSideEffects) {
    // 旧的fiber中没有处理掉的fiber都需要全部删除
    existingChildren.forEach(child => deleteChild(returnFiber, child));
  }

  if (getIsHydrating()) {
    const numberOfForks = newIdx;
    pushTreeFork(returnFiber, numberOfForks);
  }
  return resultingFirstChild;
}




// 返回旧的fiber链里面能够复用的最大的索引
function placeChild(
  newFiber,
  lastPlacedIndex,
  newIndex,
) {
  newFiber.index = newIndex;
  const current = newFiber.alternate
  if (current !== null) {
    const oldIndex = current.index

    if (oldIndex < lastPlacedIndex) {
      // 因为newChildren的顺序遍历，当前newFiber在上一个newFiber后面
      // 而当前newFiber能复用的fiber在最大复用的oldFiber前面，则表明顺序出现了变化，需要移动
      // lastPlacedIndex保持不变
      newFiber.flags |= Placement;
      return lastPlacedIndex;
    } else {
      // 能复用并且顺序没变化 lastPlacedIndex更新
      return oldIndex;
    }
  } else {
    // 新增的情况 打上effectTag lastPlacedIndex保持不变
    newFiber.flags |= Placement
    return lastPlacedIndex;
  }
}
