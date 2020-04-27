// Global state I'd like to keep in one convenient place.
export default {
  api: 'https://api.beautifulrising.org/api/v1',
  cacheLifespan: 60 * 60 * 24 * 1000,
  //cacheLifespan: 10000,
  errorPage: '/error',
  langs: ['en', 'es', 'ar', 'pt'],
  siteDomain: 'bt.org',
  toolTypes: ['story', 'tactic', 'principle', 'theory', 'methodology'],
  wpapi: 'http://bt.org/wp-json/wp/v2',
}
