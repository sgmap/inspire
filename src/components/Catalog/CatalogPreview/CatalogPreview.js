import React from 'react'
import Counter from '../../Statistics/Counter/Counter'
import Percent from '../../Statistics/Percent/Percent'

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '1em',
    fontSize: '11px',
  },
}

const CatalogPreview = ({metrics}) => {
  if (metrics) {
    return (
      <div style={styles.container}>
        <Percent value={metrics.datasets.partitions['openness'] ? metrics.datasets.partitions['openness'].yes : 0} total={metrics.datasets.totalCount} label="Données ouvertes" icon="unlock alternate icon" />
        <Percent value={metrics.datasets.partitions['download'] ? metrics.datasets.partitions['download'].yes : 0} total={metrics.datasets.totalCount} label="Téléchargeable" icon="download" />
        <Counter value={metrics.records.totalCount} label="Enregistrements" />
      </div>
    )
  }
  return <div></div>
}

export default CatalogPreview
