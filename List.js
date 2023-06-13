const mongoose = require("mongoose")
const Item = require("./Item")

const listSchema = new mongoose.Schema({
    name:{
        type: String,
        require: true
    },
    items: [Item.schema]
})
const List = mongoose.model('List', listSchema);


module.exports = List