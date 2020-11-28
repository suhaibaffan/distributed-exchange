const { PeerRPCServer } = require( './grenache-nodejs-ws/index' );
const Link = require( 'grenache-nodejs-link' );

const exchangeOrderBook = [];
const pendingOrders = [];

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
    const { buy, sell } = payload;
    handler.reply(null, 'hello')
});
