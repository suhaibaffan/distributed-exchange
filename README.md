# distributed-exchange

Run the following files in this order:

* Run `node orderbook.js`
* Run `node exchange.js`
* Run multiple clients in new windows
Example `node client.js sell 500` `node client.js buy 500`

Few things could be added if I have more time:
* Make a transaction when orders are matched, though orderbook is sending the orders to exchange.
* Deduct exchange minimal fees.
* Allow multiple currencies.
