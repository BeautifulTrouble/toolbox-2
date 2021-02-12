// Global state I'd like to keep in one convenient place.
export default {
  api: 'https://api.beautifulrising.org/api/v1',
  cacheLifespan: 60 * 60 * 24 * 1000, // ms until toolbox api data is reloaded
  defaultCollection: 'andrews-list',
  errorPage: '/error',
  imagePrefix: 'https://beautifulrising.org',
  langs: ['ar', 'es', 'fr', 'pt', 'en'],
  mountPoint: '#page',
  pdf: 'https://api.beautifulrising.org/pdf',
  siteDomain: 'bt.org',
  siteUrl: 'https://beautifultrouble.org',
  socialFacebook: 'https://www.facebook.com/BeautifulTroubleBook',
  socialInstagram: 'https://www.instagram.com/beautifultroublehq/',
  socialTwitter: 'https://twitter.com/BTroublemakers',
  submissionForm: '/toolbox-suggestion',
  toolTypes: ['story', 'tactic', 'principle', 'theory', 'methodology'],
  trainingForm: 'https://docs.google.com/forms/d/e/1FAIpQLSeOtOoVxUeVWzwGw4z-w0xXS8Z2OaDcr7GaShWl4WkDtaXOiQ/viewform',
}
