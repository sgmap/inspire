export default function fetchCatalog(catalogId) {
  if (!catalogId) throw new Error('catalogId is required')
  return fetch(`https://inspire.data.gouv.fr/api/geogw/catalogs/${catalogId}`)
    .then(response => response.json())
    .catch((err) => {
      console.error(err)
    })
  }
