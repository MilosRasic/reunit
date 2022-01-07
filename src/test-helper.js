require('core-js/stable/array/at');

const chai = require('chai');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);

global.proxyquire = proxyquire;
global.sinon = sinon;
global.expect = chai.expect;
