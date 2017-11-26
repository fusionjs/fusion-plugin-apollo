/* eslint-env browser */
import CoreApp from 'fusion-core';
import {prepare} from 'fusion-react-async';
import serverRender from './server';
import clientRender from './client';

import ProviderPlugin from './plugin';
import ProvidedHOC from './hoc';
import Provider from './provider';

export default class App extends CoreApp {
  constructor(root, getClient) {
    super(null, (el, ctx) => {
      return prepare(el).then(() => {
        return __NODE__ ? serverRender(el, ctx) : clientRender(el);
      });
    });

    
    const preRenderPlugin = (ctx, next) => {
      ctx.apolloClient = getClient(ctx);
      ctx.apolloRoot = root;
      return next();
    };

    this.plugins.unshift(preRenderPlugin);
  }
}

function ApolloSSR() {
  return function middleware(ctx, next) {
    ctx.element = ctx.apolloRoot({client: ctx.apolloClient});
    return next();
  };
}

export {ApolloSSR, ProviderPlugin, ProvidedHOC, Provider};
