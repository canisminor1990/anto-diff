import { Component } from 'react';
import dva from 'dva';
import createLoading from 'dva-loading';

let app = dva({
  history: window.g_history,
  
});

window.g_app = app;
app.use(createLoading());
app.use(require('/Users/yangyufan/anto-diff/node_modules/dva-immer/lib/index.js').default());
app.model({ namespace: 'g', ...(require('/Users/yangyufan/anto-diff/panel/models/g.js').default) });

class DvaContainer extends Component {
  render() {
    app.router(() => this.props.children);
    return app.start()();
  }
}

export default DvaContainer;
