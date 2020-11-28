const { PeerRPCServer } = require( './grenache-nodejs-ws/index' );
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
        console.log( orderBooks.getOrderBook(userBook.id ) );
        const foundBook = orderBooks.getOrderBook( userBook.id );
        console.log( foundBook )
        foundBook.placeOrder( buy ? 'buy' : 'sell', value );
        console.log( foundBook );
        handler.reply( null, 'placedOrder' );
        checkForAllPendingOrdersAndTryToExchange();
    }
});

function checkForAllPendingOrdersAndTryToExchange () {
    console.log( orderBooks.getAllBooksPendingOrder() );
    const allPendingOrders = orderBooks.getAllBooksPendingOrder();
    
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
        // remove from pending and add in completed
    }

    placeOrder ( operation, value ) {
        this.pendingOrders.push({ operation, value, created_at: new Date() });
    }
}

