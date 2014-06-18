describe('unit/preprocessor.js', function() {
  var rewire = require('rewire');
  var module = rewire('../../index');
  var cjsxTransformer;
  var coffeeTransformerFactory;
  var coffeeTransformer;
  var originalCjsxTransformer;
  var originalCoffeeTransformerFactory;

  var transformedCjsxContent = 'transformed cjsx';
  var transformedCoffeeContent = 'transformed coffee';

  var logger = {
    create: function(name) {
      return {
        debug: function(msg) {},
        info: function(msg) {},
        warn: function(msg) {},
        error: function(msg) {}
      };
    }
  };

  beforeEach(function() {
    cjsxTransformer = sinon.stub();
    coffeeTransformerFactory = sinon.stub();
    coffeeTransformer = sinon.stub();

    coffeeTransformerFactory.returns(coffeeTransformer);

    originalCjsxTransformer = module.__get__('cjsxTransformer');
    originalCjsxTransformer = module.__get__('coffeeTransformerFactory');

    module.__set__('cjsxTransformer', cjsxTransformer);
    module.__set__('coffeeTransformerFactory', coffeeTransformerFactory);
  });

  afterEach(function() {
    module.__set__('cjsxTransformer', originalCjsxTransformer);
    module.__set__('coffeeTransformerFactory', originalCoffeeTransformerFactory);
  });

  describe('When requiring the module', function() {

    it('should return a preprocessor function', function() {
      module.should.have.property('preprocessor:cjsx').be.an('array')
        .and.have.length(2);
      var preprocessor = module['preprocessor:cjsx'];
      preprocessor[0].should.equal('factory');
      preprocessor[1].should.be.a('function');
    });

    it('should take four arguments', function() {
      var factory = module['preprocessor:cjsx'][1];
      factory.should.have.length(4);
    });
  });

  describe('When calling the factory', function() {
    var factory;
    var cjsxPreprocessor;
    var args = 'args';
    var config = { conf: 'conf' };
    var helper = 'helper';

    beforeEach(function() {
      factory = module['preprocessor:cjsx'][1];
      cjsxPreprocessor = factory(args, config, logger, helper);
    });

    it('should return another function taking 3 arguments', function() {
      cjsxPreprocessor.should.be.a('function');
      cjsxPreprocessor.should.have.length(3);
    });

    it('should create coffee transformer from same args', function() {
      var call = coffeeTransformerFactory.getCall(0);

      call.args[0].should.equal(args);
      call.args[1].conf.should.equal(config.conf);
      call.args[2].should.equal(logger);
      call.args[3].should.equal(helper);
    });

    it('should defer file name changes to coffee preprocessor', function() {
      var call = coffeeTransformerFactory.getCall(0);
      call.args[1].transformPath.should.be.a('function');
    });

    it('should rename the file from .cjsx to .js', function() {
      var call = coffeeTransformerFactory.getCall(0);
      call.args[1].transformPath('abc.cjsx').should.equal('abc.js')
    });

    it('should rename the file from .coffee to .js', function() {
      var call = coffeeTransformerFactory.getCall(0);
      call.args[1].transformPath('abc.coffee').should.equal('abc.js')
    });

    it('should keep .js file extension', function() {
      var call = coffeeTransformerFactory.getCall(0);
      call.args[1].transformPath('abc.js').should.equal('abc.js')
    });

    describe('and calling the preprocessor with no errors', function() {
      var callback;
      var file;

      beforeEach(function() {
        file = {
          path: 'abc.cjsx',
          originalPath: 'abc.cjsx'
        };
        cjsxTransformer.returns(transformedCjsxContent);
        callback = sinon.spy();
        cjsxPreprocessor('content', file, callback);
      });

      it('should call the react transformer', function() {
        cjsxTransformer.should.have.been.calledWith('content');
      });

      it('should call the coffee preprocessor', function() {
        coffeeTransformer.should.have.been.calledWith(transformedCjsxContent, file, callback);
      });
    });

    describe('and calling the preprocessor with cjsx errors', function() {
      var callback;
      var file;
      var error = new SyntaxError('Some Syntax Error');
      error.location = {
        first_line: 15
      };

      beforeEach(function() {
        file = {
          path: 'abc.cjsx',
          originalPath: 'abc.cjsx'
        };
        cjsxTransformer.throws(error);
        callback = sinon.spy();
        cjsxPreprocessor('content', file, callback);
      });

      it('should call the react transformer', function() {
        cjsxTransformer.should.have.been.calledWith('content');
      });

      it('should call the react transformer', function() {
        callback.should.have.been.calledWith(error);
      });

      it('should not call the coffee preprocessor', function() {
        coffeeTransformer.should.not.have.been.called;
      });
    });
  });
});
