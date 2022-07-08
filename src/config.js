// Global state I'd like to keep in one convenient place.
export default {
  api: 'https://api.beautifulrising.org/api/v1',
  cacheLifespan: 60 * 60 * 4 * 1000, // ms until toolbox api data is reloaded
  imagePrefix: 'https://beautifulrising.org',
  langs: ['ar', 'en', 'es', 'fr', 'it', 'my', 'pt', 'ru'],
  linkPrefix: '/toolbox',
  metaImageUrl: 'http://static1.squarespace.com/static/5f9687424db8026cc2f2466c/t/60375dd74142e82bebb9da62/1614241250959/BT_logo.png?format=1500w',
  mountPoint: '#page',
  pdf: 'https://api.beautifulrising.org/pdf',
  siteDomain: 'beautifultrouble.org',
  siteUrl: 'https://beautifultrouble.org',
  socialFacebook: 'https://www.facebook.com/BeautifulTroubleHQ',
  socialInstagram: 'https://www.instagram.com/beautifultroublehq/',
  socialTwitter: 'https://twitter.com/BTroublemakers',
  submissionForm: '/toolbox-suggestion',
  toolTypes: ['story', 'tactic', 'principle', 'theory', 'methodology'],
}
