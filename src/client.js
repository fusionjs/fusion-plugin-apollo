// @flow
/* eslint-env browser */
import ReactDOM from 'react-dom';

export default (root: React$Element<any>) => {
  const domElement = document.getElementById('root');
  if (domElement instanceof HTMLElement) {
    ReactDOM.hydrate
      ? ReactDOM.hydrate(root, domElement)
      : ReactDOM.render(root, domElement);
  }
};
