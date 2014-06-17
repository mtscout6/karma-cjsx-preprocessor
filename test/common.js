global.chai = require('chai');
global.expect = chai.expect;
chai.should();

global.sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
