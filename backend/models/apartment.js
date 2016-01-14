/**
 * contractID-apartmentID mapping
 *
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ApartmentSchema = new Schema({
    ApartmentID: Number,
    FamilyID:Number,
    DSO:String,
    ContractID:Number,
    POD:String,
    PV:Number,
    City:String
},{collection:'apmapping'});

var Apartment = mongoose.model('Apartment',ApartmentSchema);

module.exports = Apartment;

module.exports.getApartmentID = function(id,cb){
    Apartment.findOne({ContractID:id})
        .exec(function(err,apartment){
            if(err) return cb(err);
            if(!apartment) return cb('apartment not found');
            cb(null,apartment);
        });
};
