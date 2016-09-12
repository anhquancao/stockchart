var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var stockSchema = new Schema({
    name: String,
    code: String
});

module.exports = mongoose.model("Stock", stockSchema);
