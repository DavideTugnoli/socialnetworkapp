const {MongoClient} = require('mongodb');
const url = 'mongodb://mongosrv';
const client = new MongoClient(url);

let _db; // oggetto in cui salvo la connessione al db

module.exports = {
    connect: async () => {
        try {
            await client.connect();
            _db = client.db('socialnetwork');
        } catch (err) {
            console.error(err);
            throw err;
        }
    },
    getDb: () => _db,
    close: () => client.close()
};
