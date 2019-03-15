/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import App, {createPlugin} from 'fusion-core';
import {GetApolloContextToken} from '../index.js';

const app = new App();

app.register(GetApolloContextToken, ctx => ({
  testcase: ctx.path,
}));

app.register(GetApolloContextToken, () => ({
  testcase: 'with no context',
}));

const plugin = createPlugin({
  provides: () => {
    return () => {};
  },
});

app.register(GetApolloContextToken, plugin);
