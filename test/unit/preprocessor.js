describe('unit/preprocessor.js', function() {
  var rewire = require('rewire');
  var module = rewire('../../index');
  var transformStub;
  var originalTransformer;

  beforeEach(function() {
    transformStub = sinon.stub();
    originalTransformer = module.__get__('transformer');
    module.__set__('transformer', transformStub);
  });

  afterEach(function() {
    module.__set__('transformer', originalTransformer);
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
    var result;

    beforeEach(function() {
      factory = module['preprocessor:cjsx'][1];
      result = factory();
    });

    it('should return another function taking 3 arguments', function() {
      result.should.be.a('function');
      result.should.have.length(3);
    });

    describe('and calling the result', function() {
      var callback;
      var file;

      beforeEach(function() {
        file = {
          path: 'abc.cjsx',
          originalPath: 'abc.cjsx'
        };
        transformStub.returns('transformed content');
        callback = sinon.spy();
        result('content', file, callback);
      });

      it('should call the react transformer', function() {
        transformStub.should.have.been.calledWith('content');
      });

      it('should call the callback with the transformed content', function() {
        callback.should.have.been.calledWith('transformed content');
      });

      it('should rename the file from .cjsx to .js', function() {
        file.path.should.equal('abc.js');
      });

      it('should keep .js file extension', function() {
        file = {
          path: 'abc.js',
          originalPath: 'abc.js'
        };

        transformStub.returns('transformed content');
        callback = sinon.spy();
        result('content', file, callback);
        file.path.should.equal('abc.js');
      });
    });
  });
});
