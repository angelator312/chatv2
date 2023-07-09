const { MongoClient } = require('mongodb');
function sRandom() {
    let strg = '';
    for (let index = 0; index < 22; index++) {
        strg += Math.floor(Math.random() * 10)
    }
    return strg
}
class Mongostore {
    constructor(kolekcia) {
        this.kolekcia = kolekcia
    }
    async conect(urlforconnect) {
        const client = new MongoClient(urlforconnect ?? 'mongodb://test:test@127.0.0.1/test');
        // Свързваме се със Mongo Сървъра
        await client.connect();

        // Взимаме си базата с която ще работим
        const database = client.db();
        // Взимаме си колекцията с която ще работим
        this.collection = database.collection(this.kolekcia);
    }
    async addMsg(chat,mem,msg,enc,extra={}) {
        const v={
            chat,
            time:new Date(),
            msg,mem,enc,
            ...extra
        };
        const i= await this.collection.insertOne(v);
        v._id=i.insertedId;
        return v;
    }
    // async deletekey(key) {
    //     await this.collection.deleteOne({ _id: key });

    // }
    // async getkey(key) {
    //     const data = await this.collection.findOne({ _id: key });
    //     if (!data) {
    //         return null;
    //     }
    //     // delete data._id;
    //     return data;
    // }
    async getMsgs(chat_id){
        const data =  await this.collection.find({ chat:chat_id },{sort:{time:'ascending'}}).toArray();
        if(data.length===0){
            return null;
        }
        return data;
    }
}
module.exports = {
    Mongostore,sRandom
}