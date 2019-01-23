
const files = require.context('../models', true, /(Module|Utils)\.js$/)
console.log(files);
