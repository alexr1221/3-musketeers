const nock = require('nock');
const ora = require('ora');
const currency = require('./');

beforeEach(() => {
  nock('https://api.exchangeratesapi.io')
    .get('/latest?base=USD')
    .reply(200, {
      'base': 'USD',
      'rates': {
        'EUR': 0.899
      }
    });

  nock('https://api.exchangeratesapi.io')
    .get('/latest?base=EUR')
    .reply(200, {
      'base': 'EUR',
      'rates': {
        'USD': 1.1122
      }
    });

  nock('https://blockchain.info')
    .get('/ticker')
    .reply(200, {
      'USD': {
        '15m': 8944.49,
        'last': 8944.49,
        'buy': 8944.49,
        'sell': 8944.49,
        'symbol': '$'
      },
      'EUR': {
        '15m': 8048.11,
        'last': 8048.11,
        'buy': 8048.11,
        'sell': 8048.11,
        'symbol': '€'
      }
    });
});

test('convert 1 USD to EUR', async () => {
    var amount = 1, from = "USD", to = "EUR";
    var opts = { amount, from, to };
    var res = await currency(opts);
    expect(res).toBe(0.899);
});

test('convert 1 USD to USD', async () => {
    var amount = 1, from = "USD", to = "USD";
    var opts = { amount, from, to };
    var res = await currency(opts);
    expect(res).toBe(1);
});

test('convert 1 EUR to USD', async () => {
    var amount = 1, from = "EUR", to = "USD";
    var opts = { amount, from, to };
    var res = await currency(opts);
    expect(res).toBe(1.1122);
});

test('convert 1 BTC to USD', async () => {
    var amount = 1, from = "BTC", to = "USD";
    var opts = { amount, from, to };
    var res = await currency(opts);
    expect(res).toBe(8944.49);
});

test('convert 1 BTC to EUR', async () => {
    var amount = 1, from = "BTC", to = "EUR";
    var opts = { amount, from, to };
    var res = await currency(opts);
    expect(res).toBe(8048.11);
});

test('convert without arguments', async () => {
    var opts = {};
    var res = await currency(opts);
    expect(res).toBe(0.00011180067281644902);
});

test('convert with amount only', async () => {
    var amount = 1;
    var opts = { amount };
    var res = await currency(opts);
    expect(res).toBe(0.00011180067281644902);
});

test('convert with amount and (from) currency only', async () => {
    var amount = 1, from = "EUR";
    var opts = { amount, from };
    var res = await currency(opts);
    expect(res).toBe(0.0001242527748750949);
});

test('convert without a correct `from` or `to` currency value', async () => {
    var amount = 1, from = "FP", to = "NRML";
    var opts = { amount, from, to };
    try {
        await currency(opts);
    } catch (err) {
        error = err;
    }
    //expect(error).toThrow("'from' or/and 'to' are wrong");
    expect(error).toEqual(
        new Error('💵 Please specify a valid `from` and/or `to` currency value!')
    );
});
