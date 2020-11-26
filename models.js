const mongoose = require('mongoose');

var url = "mongodb+srv://admin:b6AZoa2pNI6rZ2fJ@cluster0.wy392.mongodb.net/Movies?authSource=admin&replicaSet=atlas-ka4ujp-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true"

mongoose.connect(url,{useNewUrlParser:true, useUnifiedTopology:true, useFindAndModify: false, useCreateIndex: true }, (err)=>{
    if(!err){
        console.log("Database connected...");
    }else{
        console.log("Error in connecting to Database");
    }
});

const { Schema, model, Types } = require('mongoose')

var MovieSchema = new Schema({
    details: {
        type: {
            title: { type: String },
            seeds: { type: Number },
            peers: { type: Number },
            size: { type: String },
            desc: { type: String },
            time: { type: String },
            link: { type: String }
        }
    },
    hash: { type: String }
});

model('movie', MovieSchema);