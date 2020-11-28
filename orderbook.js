const { PeerRPCServer, PeerRPCClient } = require( './grenache-nodejs-ws/index' );
const Link = require( 'grenache-nodejs-link' );
const _ = require( 'underscore' );

class OrderBooks {
    constructor () {
        this.orderBooks = [];
    }

    getOrderBook ( orderbook ) {
        return this.orderBooks.find( book => book.id === orderbook );
    }

    getAllBooks () {
        return this.orderBooks;
    }

    getAllBooksPendingOrder () {
        //TODO add the user orderbooks to the pending orders for uniqueness.
        return this.orderBooks.map( book => book.pendingOrders ).reduce( ( a, b ) => a.concat( b ) );
    }

    newBook ( uuid ) {
        const book = new OrderBook( uuid );
        this.orderBooks.push( book );
        return book;
    }
}

const link = new Link({
    grape: 'http://127.0.0.1:30001'
});
link.start();
const peer = new PeerRPCServer( link, {});
peer.init();
const service = peer.transport( 'server' );
service.listen( 1336 );

const clientPeer = new PeerRPCClient( link, {});
clientPeer.init();

setInterval( () => {
    link.announce( 'orderbook_workload', service.port, {})
}, 1000 );

const orderBooks = new OrderBooks();

service.on( 'request', async (rid, key, payload, handler) => {
    const { userId, create, buy, sell, userBook, value } = payload;
    if ( create ) {
        const orderBookInstance = orderBooks.newBook( userId );
        // console.log( orderBooks.getOrderBook(orderBookInstance.id ) );
        
        handler.reply( null, orderBookInstance );
    }

    if ( buy || sell ) {
        console.log( orderBooks.getOrderBook( userBook.id ) );
        const foundBook = orderBooks.getOrderBook( userBook.id );
        console.log( foundBook )
        const updatedBook = foundBook.placeOrder( buy ? 'buy' : 'sell', value, userBook.id );
        console.log( foundBook );
        handler.reply( null, userBook );
        checkForAllPendingOrdersAndTryToExchange();
    }
});

function checkForAllPendingOrdersAndTryToExchange () {
    console.log( orderBooks.getAllBooksPendingOrder() );
    const allPendingOrders = orderBooks.getAllBooksPendingOrder();
    // this search can be optimized
    for ( order of allPendingOrders ) {
        // TODO o.id !== order.id && add this condition for avoid data races.
        const foundItem = allPendingOrders.find(  o => o.id !== order.id && o.value === order.value && o.operation !== order.operation );
        if ( foundItem ) {
            // TODO also send the user order books to make a transaction in exchange between users.
            clientPeer.request( 'exchange_worker', { foundItem }, { timeout: 10000 }, (err, data) => {
                if (err) {
                    console.error(err)
                    process.exit(-1)
                }
                // TODO add this order to completed.
                // TODO & remove orders from pending orders.
                console.log(data) // world
            });
        }
    }
}

class OrderBook {
    constructor ( uuid ) {
        this.id = `${uuid}_orderbook`;
        this.completedOrders = [];
        this.pendingOrders = [];
    }

    getUser () {
        return this.id;
    }

    getOrders () {
        return this.completedOrders;
    }

    getPendingOrders () {
        return this.pendingOrders;
    }

    completedOrder ( order ) {
        // TODO remove from pending and add in completed
    }

    placeOrder ( operation, value, id ) {
        this.pendingOrders.push({ id, operation, value, created_at: new Date() });
        return this;
    }
}

