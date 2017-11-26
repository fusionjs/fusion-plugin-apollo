/* eslint-env node */
import {html} from 'fusion-core';
import {renderToStringWithData} from 'react-apollo';

export default (root, ctx) => {
  return renderToStringWithData(root).then(content => {
    const initialState = ctx.apolloClient.cache.extract();
    const serialized = JSON.stringify(initialState);
    const script = html`<script type="application/json" id="__APOLLO_STATE__">${serialized}</script>`;
    ctx.body.body.push(script);
    return `<div id='root'>${content}</div>`;
  });
};
