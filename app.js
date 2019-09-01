var express = require("express");
var methodoverride = require("method-override");
var bodyparser = require("body-parser");
var mongoose = require("mongoose");
var expresssanitizer = require("express-sanitizer");

//app config
var app = express();
app.use(bodyparser.urlencoded({
    extended: true
}));
app.use(expresssanitizer());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodoverride("_method"));


//mongoose config

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://yokomon:macaulay1234@yokoapp-9gnix.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
    useNewUrlParser: true
});
client.connect(err => {
    const collection = client.db("test").collection("devices");
    // perform actions on the collection object
    client.close();
});

mongoose.connect(process.env.MONGODB_URI ||
    'mongodb://localhost/127.0.0.1');

var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {
        type: Date,
        default: Date.now
    }

});
var blog = mongoose.model("blog", blogSchema);

// blog.create({
//     title: "love",
//     image: ""
// })

app.get("/", function (req, res) {
    res.redirect("/blogs")
})

app.get("/blogs", function (req, res) {
    blog.find({}, function (err, blogx) {
        if (err) {
            console.log(err);
        } else {
            res.render("index", {
                blogs: blogx
            })
        }
    })
})

//new route
app.get("/blogs/new", function (req, res) {
    res.render("new");
})

//create route
app.post("/blogs", function (req, res) {
    //create blog
    console.log(req.body);
    req.body.blog.body = req.sanitize(req.body.blog.body)
    console.log("============================");
    blog.create(req.body.blog, function (err, newBlog) {
        if (err) {
            res.render(err)
        } else {
            //redirect
            res.redirect("/blogs");
        }
    })

})

//show route
app.get("/blogs/:id", function (req, res) {
    blog.findById(req.params.id, function (err, foundblog) {
        if (err) {

        } else {
            res.render("show", {
                blog: foundblog
            })
        }
    })
})

//edit route
app.get("/blogs/:id/edit", function (req, res) {
    blog.findById(req.params.id, function (err, foundblog) {
        if (err) {
            res.redirect("/blogs")
        } else {
            res.render("edit", {
                blog: foundblog
            });
        }
    })
})

//update route
app.put("/blogs/:id", function (req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body)
    blog.findByIdAndUpdate(req.params.id, req.body.blog,
        function (err, updatedblog) {
            if (err) {
                res.redirect("/blogs");
            } else {
                res.redirect("/blogs/" + req.params.id);
            }
        })
})

// delete route
app.delete("/blogs/:id", function (req, res) {
    //destroy blog
    blog.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    })

    //redirect
})

app.listen(process.env.port || 3000, function () {
    console.log("we are up and running !!!")
})