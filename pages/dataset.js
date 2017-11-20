import React from 'react'
import PropTypes from 'prop-types'

import { _get } from '../lib/fetch'

import withI18n from '../components/hoc/with-i18n'

import Page from '../components/page'
import Meta from '../components/meta'
import Content from '../components/content'
import Container from '../components/container'
import Box from '../components/box'

import Producer from '../components/dataset/producer'

import { GEODATA_API_URL, DATAGOUV_API_URL } from '@env'

class DatasetPage extends React.Component {
  static propTypes = {
    dataset: PropTypes.shape({
      metadata: PropTypes.shape({
        title: PropTypes.string.isRequired
      }).isRequired
    }).isRequired,

    datagouvPublication: PropTypes.shape({
      remoteId: PropTypes.isRequired
    })
  }

  static async getInitialProps({ query }) {
    const [dataset, publications] = await Promise.all([
      _get(`${GEODATA_API_URL}/records/${query.did}`),
      _get(`${GEODATA_API_URL}/records/${query.did}/publications`)
    ])

    const datagouvPublication = publications.find(p => p.target === 'dgv')

    return {
      dataset,
      datagouvPublication
    }
  }

  state = {
    datagouvDataset: null
  }

  async componentDidMount() {
    const { datagouvPublication } = this.props

    // Let’s not depend too much on data.gouv.fr’s availability, so we’re
    // fetching this after the page has loaded.
    if (datagouvPublication && datagouvPublication.remoteId) {
      const datagouvDataset = await _get(`${DATAGOUV_API_URL}/datasets/${datagouvPublication.remoteId}/`)

      this.setState(() => ({
        datagouvDataset
      }))
    }
  }

  render() {
    const { dataset: { metadata }, datagouvPublication, t } = this.props
    const { datagouvDataset } = this.state

    return (
      <Page>
        <Meta title={metadata.title} />

        <Content clouds>
          <Container fluid>
            <div className='container'>
              <div className='left'>
                <Box>
                  {datagouvPublication && (
                    datagouvDataset ? <Producer producer={datagouvDataset.organization} /> : t('common:loading')
                  )}
                </Box>
              </div>
              <div className='main'>
                <Box>
                  {metadata.title}
                </Box>
              </div>
              <div className='right'>
                <Box />
              </div>
            </div>
          </Container>
        </Content>

        <style jsx>{`
          .container {
            display: flex;

            flex-wrap: wrap;
            @media (max-width: 768px) {
              flex-direction: column;
            }
          }

          .left, .right {
            width: 350px;

            @media (max-width: 1480px) {
              width: 300px;
            }

            @media (max-width: 1280px) {
              width: 250px;
            }

            @media (max-width: 1080px) {
              width: 200px;
            }

            @media (max-width: 768px) {
              width: 100%;
            }
          }

          .left {
            @media (max-width: 960px) {
              margin: 0 0 20px 0;
            }

            @media (max-width: 768px) {
              order: 1;
            }
          }

          .right {
            @media (max-width: 960px) {
              flex: 1 0 100%;
            }

            @media (max-width: 768px) {
              order: 2;
            }
          }

          .main {
            flex: 1;
            margin: 0 20px;

            @media (max-width: 960px) {
              margin: 0 0 0 20px;
            }

            @media (max-width: 768px) {
              margin: 0 0 20px 0;
              order: 0;
            }
          }
        `}</style>
      </Page>
    )
  }
}

export default withI18n('dataset')(DatasetPage)
