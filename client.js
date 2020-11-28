const Link = require( 'grenache-nodejs-link' );
const { v4 } = require( 'uuid' );
const { PeerRPCClient } = require( './grenache-nodejs-ws' );

const link = new Link({
    grape: 'http://127.0.0.1:30001'
});
link.start();

const peer = new PeerRPCClient( link, {});
peer.init();

peer.request( 'orderbook_workload', { userId: v4(), create: true }, { timeout: 1000 }, ( err, data ) => {
    if (err) {
        console.error(err)
        process.exit(-1)
    }
    console.log( data ); // here it should return the new user order book node details.
    userOrderbookNode = data;
    const operation = process.argv[2];

    if ( operation === 'buy' ) {
        peer.request( 'orderbook_workload', { buy: true, value: 500, userBook: data }, { timeout: 1000 }, ( err, data ) => {
            if ( err ) {
                //retry after some time;
                console.log( err );
            }
            console.log( data );
        });
    }
    
    if ( operation === 'sell' ) {
        peer.request( 'orderbook_workload', { sell: true, value: 500, userBook: data }, { timeout: 1000 }, ( err, data ) => {
            if ( err ) {
                //retry after some time;
                console.log( err );
            }
            console.log( data );
        });
    }
});
