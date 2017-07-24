import { injectReducer } from 'common/store/reducers'

export default store => ({
  async getComponent(nextState, cb) {
    const CatalogsListContainer = await import(/* webpackChunkName: 'catalogs' */ './containers/CatalogsListContainer')
    const catalogs = await import(/* webpackChunkName: 'catalogs' */ './modules/catalogs')

    injectReducer(store, {
      key: 'catalogs',
      reducer: catalogs.reducer
    })

    cb(null, CatalogsListContainer.default)
  },

  async onEnter() {
    const catalogs = await import(/* webpackChunkName: 'catalogs' */ './modules/catalogs')

    injectReducer(store, {
      key: 'catalogs',
      reducer: catalogs.reducer
    })

    store.dispatch(catalogs.actions.list())
  }
})