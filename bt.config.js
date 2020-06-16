// Global state I'd like to keep in one convenient place.
export default {
  api: 'https://api.beautifulrising.org/api/v1',
  cacheLifespan: 60 * 60 * 24 * 1000,
  //cacheLifespan: 10000,
  defaultCollection: 'andrews-list',
  errorPage: '/error',
  imagePrefix: 'https://beautifulrising.org',
  langs: ['en', 'es', 'ar', 'pt'],
  pdf: 'https://api.beautifulrising.org/pdf',
  siteDomain: 'bt.org',
  siteUrl: 'https://beautifultrouble.org',
  socialFacebook: 'https://www.facebook.com/BeautifulTroubleBook',
  socialInstagram: 'https://www.instagram.com/beautifultroublehq/',
  socialTwitter: 'https://twitter.com/BTroublemakers',
  toolTypes: ['story', 'tactic', 'principle', 'theory', 'methodology'],
  trainingForm: 'https://docs.google.com/forms/d/e/1FAIpQLSeOtOoVxUeVWzwGw4z-w0xXS8Z2OaDcr7GaShWl4WkDtaXOiQ/viewform',
  wpapi: 'http://bt.org/wp-json/wp/v2',
}
