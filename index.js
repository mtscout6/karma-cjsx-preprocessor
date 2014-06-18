var cjsxTransformer = require('coffee-react-transform');
var coffeeTransformerFactory = require('karma-coffee-preprocessor')['preprocessor:coffee'][1];

function factory(args, config, logger, helper) {
  var log = logger.create('preprocessor.cjsx');

  config = config || {};

  config.transformPath = function(filepath) {
    return filepath.replace(/\.cjsx$/, '.js').replace(/\.coffee$/, '.js');
  };

  var coffeeTransformer = coffeeTransformerFactory(args, config, logger, helper)

  return function(content, file, done) {
    var e, coffeeResult;
    log.debug('Processing "%s".', file.originalPath);

    try {
      coffeeResult = cjsxTransformer(content);
    } catch (e) {
      log.error('%s\n  at %s:%d', e.message, file.originalPath, e.location.first_line);
      done(e);
      return;
    }

    coffeeTransformer(coffeeResult, file, done);
  };
};

module.exports = {
  'preprocessor:cjsx': ['factory', factory]
};
