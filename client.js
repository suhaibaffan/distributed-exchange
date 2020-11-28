const Link = require( 'grenache-nodejs-link' );
const { PeerRPCClient } = require( './grenache-nodejs-ws' );

const link = new Link({
    grape: 'http://127.0.0.1:30001'
});
link.start();

const peer = new PeerRPCClient( link, {});
peer.init();

peer.request( 'exchange_worker', { buy: true }, { timeout: 10000 }, (err, data) => {
    if (err) {
        console.error(err)
        process.exit(-1)
    }
    console.log(data) // world
});
