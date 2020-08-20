const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const expressSanitizer = require('express-sanitizer');

const app = express();

mongoose.connect('mongodb://localhost:27017/restful_blog_app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
//App Config
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(expressSanitizer());
mongoose.set('useFindAndModify', false);

// Mongodb Config
const blogSchema = new mongoose.Schema({
    title: String, 
    image: String, 
    body: String, 
    created: {type: Date, default: Date.now}
});
const Blog = mongoose.model('Blog', blogSchema);

// Blog.create({
//     title: 'test Blog', 
//     image: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=660&q=80', 
//     body: 'Hello, This is a blog post'
// }, (err, newBlog) => {
//     if(err) {
//         console.log(err);
//     }
// });

// Restful Routes
app.get('/', (req, res) => {
    res.redirect('/blogs');
})
//index route
app.get('/blogs', (req, res) => {
    Blog.find({}, (err, blogs) => {
        if(err) {

            console.log(err);
        }else {
            res.render('index', {blogs: blogs});
        }
    });
});

//new Route
app.get('/blogs/new', (req, res) => {
    res.render('new');
});

//create route
app.post('/blogs', (req, res) => {
    //create blog
    console.log(req.body);
    req.body.blog.body = req.sanitize(req.body.blog.body);
    console.log('=================');
    console.log(req.body);
    Blog.create(req.body.blog, (err, newBlog) => {
        if(err) {
            res.render('new');
        } else {
            //redirect to blogs index
            res.redirect('/blogs');
        }
    })
});

//Show Route
app.get('/blogs/:id', (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if(err) {
            console.log(err);
            res.redirect('/blogs');
        } else {
            res.render('show', {blog: foundBlog});
        }
    });
});

app.get("/blogs/:id/edit", (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if(err) {
            res.redirect('/blogs');
        } else {
            res.render('edit', {blog: foundBlog});
        }
    });
});

//UPDATE Route
app.put('/blogs/:id', (req, res) => {
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => {
        if(err) {
            res.redirect('/blogs');
        } else {
            res.redirect('/blogs/' + req.params.id);
        }
    });
});

//DELETE Route
app.delete('/blogs/:id', (req, res) => {
    Blog.findByIdAndRemove(req.params.id, err => {

        res.redirect('/blogs');
    });
});

app.listen(3000, () => {
    console.log('Server is running')
})
