import React, { Component } from 'react'
import ReactPaginate from 'react-paginate'
import { browserHistory } from 'react-router'
import { search, buildSearchQuery } from '../../fetch/fetch'
import { waitForDataAndSetState, cancelAllPromises } from '../../helpers/components'
import SearchInput from '../SearchInput/SearchInput'
import ContentLoader from '../Loader/ContentLoader'
import DatasetPreview from './DatasetPreview'
import Facets from '../Facets/Facets'
import Filter from '../Filter/Filter'
import { addFilter, removeFilter, replaceFilter } from '../../helpers/manageFilters'

const styles = {
  results: {
    display: 'flex',
    margin: '4em',
  },
  searchInputWrapper: {
    margin: '4em',
  },
  loader: {
    textAlign: 'center',
    marginTop: '5em',
  },
}

class Datasets extends Component {
  constructor(props) {
    super(props)
    this.state = {
      errors: [],
      ...props.query
    }
  }

  componentWillMount() {
    return this.search()
  }

  componentWillUnmount() {
    return cancelAllPromises(this)
  }

  search(changes = {}) {
    const params = Object.assign({}, this.state, changes);
    const { textInput, filters, page } = params

    const query = buildSearchQuery(textInput, filters, page)
    browserHistory.push(`datasets?${query}`)

    const allFilters = [...filters, {name: 'availability', value: 'yes'}, {name: 'page', value: 0}]
    return waitForDataAndSetState(search(textInput, allFilters, page), this, 'datasets')
  }

  renderResult() {
    if (this.state.errors.length) {
      return <div>An error has occurred.
                {this.state.errors.map((error, idx) => <p key={idx}>{error}</p>)}
              </div>
    }

    if (this.state.datasets) {
      if (!this.state.datasets.results.length) {
        return <div style={styles.results}>No datasets found.</div>
      } else {
        return <div style={styles.results}>
                <div>
                  {this.state.datasets.results.map((dataset, idx) => <DatasetPreview key={idx} dataset={dataset} addFilter={(filter) => this.addFilter(filter)}/>)}
                </div>
                <Facets
                  facets={this.state.datasets.facets}
                  filters={this.state.filters}
                  addFilter={(filter) => this.addFilter(filter)} />
              </div>
      }
    } else {
      return <div style={styles.loader}><ContentLoader /></div>
    }
  }

  addFilter(filter) {
    const filters = addFilter(this.state.filters, filter)
    this.setState({filters})
    this.search({filters})
  }

  removeFilter(filter) {
    const filters = removeFilter(this.state.filters, filter)
    this.setState({filters})
    this.search({filters})
  }

  replaceFilter(filter) {
    const filters = replaceFilter(this.state.filters, filter)
    this.setState({filters})
    this.search({filters})
  }

  userSearch(textInput) {
    const changes = { textInput, filters: [] }
    this.setState(changes)
    this.search(changes)
  }

  handlePageClick = (data) => {
    let selected = data.selected
    const offset = Math.ceil(selected * this.state.datasets.query.limit)

    this.setState({offset}, () => {
      this.replaceFilter({name: 'page', value: offset / this.state.datasets.query.limit})
      this.replaceFilter({name: 'offset', value: offset})
    })
  }

  render() {
    let max = 0
    if (this.state.datasets) {
      max = Math.ceil(this.state.datasets.count / this.state.datasets.query.limit)
      debugger
    }

    return (
      <div style={styles.container}>
        <div style={styles.searchInputWrapper}>
          <SearchInput
            textInput={this.state.textInput}
            filters={this.state.filters}
            handleTextChange={(textInput) => this.userSearch(textInput)} />

          {this.state.filters.map((filter, idx) => <Filter key={idx} filter={filter} onClick={(filter) => this.removeFilter(filter)} />)}
        </div>

        {this.renderResult()}

        <ReactPaginate previousLabel={'Précédent'}
                       nextLabel={'Suivant'}
                       breakLabel={<a href=''>...</a>}
                       breakClassName={'break-me'}
                       pageNum={max}
                       marginPagesDisplayed={2}
                       pageRangeDisplayed={5}
                       clickCallback={this.handlePageClick}
                       containerClassName={'pagination'}
                       subContainerClassName={'pages pagination'}
                       activeClassName={'active'} />
      </div>
    )
  }
}

export default Datasets
