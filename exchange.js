const { PeerRPCServer } = require( './grenache-nodejs-ws/index' );
const Link = require( 'grenache-nodejs-link' );

const exchangeOrderBook = [];
// TODO when you have to matching orders do a transaction.

const link = new Link({
    grape: 'http://127.0.0.1:30001'
});
link.start();
const peer = new PeerRPCServer( link, {});
peer.init();
const service = peer.transport( 'server' );
service.listen( 1337 );
setInterval( () => {
    link.announce( 'exchange_worker', service.port, {})
}, 1000 );
service.on( 'request', (rid, key, payload, handler) => {
    console.log( payload );
    const { order } = payload;
    exchangeOrderBook.push( order );
    handler.reply(null, 'Exchanged' );
});
