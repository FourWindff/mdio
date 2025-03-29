/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {HistoryState} from '@lexical/react/LexicalHistoryPlugin';
import * as React from 'react';
import {createContext} from 'react';

export type SharedHistoryContextShape = {
  historyState?: HistoryState;
};

export const ShareHistoryContext: React.Context<SharedHistoryContextShape> = createContext({});
export const useSharedHistory = (): SharedHistoryContextShape => {
  return React.useContext(ShareHistoryContext);
};


