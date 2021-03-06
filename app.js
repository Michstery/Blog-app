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


const MONGOURL = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/demo';
mongoose.Promise = global.Promise;


mongoose.connect(MONGOURL, {
    useNewUrlParser: true
}, err => {
    if (err) {
        console.error(`Error connecting to MongoDB:`, err.stack);
        console.log('Process exiting with code 1');
        process.exit(1);
    }
    console.log('Connected to DB successfully!');
});

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

app.listen(process.env.PORT || 3000, function () {
    console.log("we are up and running !!!")
})