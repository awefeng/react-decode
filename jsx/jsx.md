### JSX定义

一种JS的扩展语法（由react带火起来的），结合了xml和JS的写法，将视图和逻辑融合在一起。
每一个库可以通过自己定义的转义函数来解析JSX，React是编译为React.createElement。


### JSX和fiber

JSX只能描述当前element相关的信息，没有优先级，是否需要更新等标记。fiber节点根据JSX以及当前的上下文来生成fiber节点。

mount时：reconciler根据JSX来生成对应组件的fiber节点
update时：reconciler根据JSX和原来的fiber节点进行对比，生成新的组件对应的fiber节点，并根据对比结果打上（更新、插入、删除）标记。

