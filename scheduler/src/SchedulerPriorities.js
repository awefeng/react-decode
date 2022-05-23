/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 定义任务优先权
 * @flow
 */

export type PriorityLevel = 0 | 1 | 2 | 3 | 4 | 5;

// TODO: Use symbols?
export const NoPriority = 0; //没有优先级
export const ImmediatePriority = 1; // 立即执行
export const UserBlockingPriority = 2; // 用户阻塞
export const NormalPriority = 3; // 正常优先级
export const LowPriority = 4; // 低优先级
export const IdlePriority = 5; // 可闲置优先级 （没有其他任务的时候才执行）
