const mongoose = require('mongoose')
const Movie = mongoose.model('movie')

module.exports = function(app){
    app.get('/movies/get/:id', (req, res)=>{
        Movie.findById(req.params.id).then((data)=>{
            if(data){
                res.json(data);
            }else{
                res.json({success: false, message: "Wrong Id"})
            }
        }).catch((err)=>{
            console.log(err);
            res.json({err});
        })
    });

    app.get('/movies/list', (req, res)=>{
        Movie.find({}).then((docs)=>{
            res.json(docs);
        }).catch((err)=>{
            res.json({err});
            console.log(err);
        })
    })

    app.post('/movies/add', (req, res)=>{
        var mo = new Movie(req.body);
        mo.save().then((data)=>{
            res.json({success: true, data: data});
        }).catch((err)=>{
            res.json({success: false, err});
        })
    })
}