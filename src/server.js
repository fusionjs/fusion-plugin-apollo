/* eslint-env node */
import {renderToStringWithData} from 'react-apollo';

export default (el, apolloClient, ctx) => {
  return renderToStringWithData(el).then(content => {
    const initialState = apolloClient.cache.extract();
    ctx.initialState = initialState;
    // TODO: Store in context.
    return `<div id='root'>${content}</div>`;
  });
};
