module.exports = {
  'preprocessor:cjsx': ['factory', factory]
};

var transformer = require('coffee-react-transform');

function factory(args, config, logger, helper) {
  return function(content, file, done) {
    if (file.originalPath.substr(-5) === '.cjsx') {
      file.path = file.originalPath.slice(0, -5) + ".js";
    }
    done(transformer(content));
  };
};
