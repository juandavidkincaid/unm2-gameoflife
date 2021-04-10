let config = require('./rel.webpack.config.js');

config.forEach((cfn)=>{
    cfn.watch = true;
    cfn.watchOptions = {poll: 1000};
});

module.exports = config;