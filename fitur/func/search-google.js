const google = require('google-it');

const options = {
  page: 0, 
  safe: false, // Safe Search
  parse_ads: false, // If set to true sponsored results will be parsed
  additional_params: { 
    // add additional parameters here, see https://moz.com/blog/the-ultimate-guide-to-the-google-search-parameters and https://www.seoquake.com/blog/google-search-param/
    hl: 'id' 
  }
}

const get = async (query) => {
    try {
        const result = await google.search(query, options);
        return result;
    } catch (error) {
        throw new Error(`Error saat melakukan pencarian Google: ${error.message}`);
    }
}

module.exports = { get };