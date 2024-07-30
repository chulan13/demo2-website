const express = require('express');
const mongoose = require("mongoose");
const session = require("express-session");
// const MongoStore = require("connect-mongo");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const bodyparser = require("body-parser");
// const MongoClient = require('mongodb').MongoClient;
const Post = require('./models/BlogPost');
const { requireAuth } = require('./middleware/auth');
const app = express();

// Configure MongoDB connection 
mongoose.connect("nah, were arent close enough for you to know my db access", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
    console.log('mongoose.connected');
})
.catch((e) => {
    console.log('fuck you');
    console.log(e.reason);
});

// Configure sessions stored in MongoDB
app.use(
  session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: true,
    // store: MongoStore.create({
    //   mongoUrl: "mongodb+srv://sveethuu:LdR7KyynEjbNwFy3@cluster0.unoyisx.mongodb.net/test?retryWrites=true&w=majority",
    // }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 day 
    }
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(express.json());
require('./config/passport')(passport);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

const genSlug=(str)=>{
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

// Registration route
app.post('/register', async function (req, res) {
  const { email, password } = req.body;
  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    // Create new user
    user = new User({ email, password });
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    // Save user to DB
    await user.save();
      res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
  
  // Login route 
app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info.message });
    }
    req.logIn(user, err => {
      if (err) {
        return next(err);   
      }
      res.redirect('/index');
    });
  })(req, res, next);
});

// admin test
app.get('/dashboard', requireAuth, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  try {
      // const data = await Post.find();
      const data = await Post.find({ author: req.user.id })
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 }); 
      const totalPosts = await Post.countDocuments({ author: req.user.id });
        // const totalPosts = await Post.countDocuments({ author: req.user.id });
        // const totalPages = Math.ceil(totalPosts / limit);
      // const data = await Post.find({ author: req.user.id });
      res.render('admin/dashboard', {
        data,
        totalPages: Math.ceil(totalPosts / limit),
        currentPage: page
    });
  } catch (error) {
    console.log(error);   
  }
});

app.get('/add-post', requireAuth, async (req, res) => {
  try {
    const locals = {
      title: 'Add Post',
      content: 'lol do your worst. or best. I dont really care',
      author: req.user.id
    }
    const data = await Post.find();
    res.render('admin/add-post', {
      locals
    });
  } catch (error) {
    console.log(error);
  }
});
  
app.post('/add-post', requireAuth, async (req, res) => {
  // try {
  //   try {
  //     const newPost = new Post({
  //       title: req.body.title,
  //       pages: req.body.pages,
  //       email: req.user.email,
  //       author: req.user.id
  //     });
  //     await Post.create(newPost);
  //     res.redirect('/dashboard');
  //   } catch (error) {
  //     console.log(error);
  //   }
  // } catch (error) {
  //   console.log(error);
  // }
    const pages = Array.isArray(req.body.pages) ? req.body.pages : [req.body.pages];
    try {
        const newPost = new Post({ title: req.body.title, 
          author: req.user.id, 
          email: req.user.email, 
          content: req.body.content });
        await newPost.save();
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/edit-post/:id', requireAuth, async (req, res) => {
  const data = await Post.findOne({ _id: req.params.id });
  try {
    const locals = {
      title: "Edit Post",
      description: "the only mistake here is you",
    };
    const post = await Post.findById(req.params.id);
    if (post.author.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    res.render('admin/edit-post', {
      locals,
      data
    })
  } catch (error) {
    console.log(error);
  }
});

app.post('/edit-post/:id', requireAuth, async (req, res) => {
  // try {
  //   const post = await Post.findById(req.params.id);
  //   if (post.author.toString() !== req.user.id) {
  //       return res.status(403).json({ error: 'Unauthorized' });
  //   }
  //   await Post.findByIdAndUpdate(req.params.id, {
  //     title: req.body.title,
  //     pages: req.body.pages,
  //     email: req.user.email,
  //     author: req.user.id,
  //     updatedAt: Date.now()
  //   }); 
  //   res.redirect(`/edit-post/${req.params.id}`);
  // } catch (error) {
  //   console.log(error);
  // }


  const pages = Array.isArray(req.body.pages) ? req.body.pages : [req.body.pages];
  try {
      const updatedPost = await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            pages: pages,
            email: req.user.email,
            author: req.user.id,
            updatedAt: Date.now()
          }); 
      if (!updatedPost) {
          return res.status(404).send('Post not found');
      }
      res.redirect('/edit-post/' + req.params.id);
  } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
  }
});
  
app.post('/delete-post/:id', requireAuth, async (req, res) => {
  const data = await Post.findOne({ _id: req.params.id });
  try {
    const post = await Post.findById(req.params.id);
    if (post.author.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    await Post.deleteOne( { _id: req.params.id } );
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
  }
});

// app.get('/post/:id', async (req, res) => {
//   const {email, title} = req.params;
//   try {
//     const post = await Post.findById(req.params.id);
//     if (!post) {
//       return res.status(404).render("post not found");
//     }
//     // let slug = req.params.id;
//     // const data = await Post.findById({ _id: slug });
//     const locals = {
//       title: data.title,
//       description: "i hate myself for loving you"
//     }
//     res.render('common/post', { 
//       locals,
//       data,
//       currentRoute: `/post/${post}`
//     });
//   } catch (error) {
//     console.log(error);
//   }
// });

app.get(['/', '/index'], async (req, res) => {
  try {
    const locals = {
      title: "try so haaaard",
      content: "to get so farrrrrrr"
    }
    let perPage = 10;
    let page = req.query.page || 1;
    const data = await Post.aggregate([ { $sort: { createdAt: -1 } } ])
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec();
    // Count is deprecated - please use countDocuments
    // const count = await Post.count();
    const count = await Post.countDocuments({});
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);
    res.render('pages/index', { 
      locals,
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
      currentRoute: ['/', '/index']
    });
  } catch (error) {
    console.log(error);
  }
});

app.get('/post/:id', async (req, res) => {
  // try {
  //   let slug = req.params.id;
  //   if (!mongoose.Types.ObjectId.isValid(slug)) {
  //     return res.redirect('..');
  //   }
  //   const data = await Post.findById({ _id: slug });
  //   const locals = {
  //     title: data.title,
  //     description: "ima furry hahaahahahahhhaah"
  //   }
  //   res.render('common/post', { 
  //     locals,
  //     data,
  //     currentRoute: `/post/${slug}`
  //   });
  // } catch (error) {
  //   console.log(error);
  // }
  const postId = req.params.id;

    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.render('common/post', { post });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Route to render chapter page
app.get('/post/:postId/chapter/:chapterId', requireAuth, async (req, res) => {
  const { postId, chapterId } = req.params;

  try {
      const post = await Post.findById(postId);

      if (!post) {
          return res.status(404).json({ error: 'Post not found' });
      }

      const chapter = post.chapters.id(chapterId);

      if (!chapter) {
          return res.status(404).json({ error: 'Chapter not found' });
      }

      res.render('common/chapter', { post, chapter });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
  }
});

// Route to add a new chapter to a post
app.post('/post/:id/chapters', requireAuth, async (req, res) => {
  const postId = req.params.id;
  const { title, content } = req.body;

  try {
      const post = await Post.findById(postId);

      if (!post) {
          return res.status(404).json({ error: 'Post not found' });
      }

      // Add new chapter to the post
      post.chapters.push({ title, content });
      await post.save();

      res.redirect(`/post/${postId}`);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
  }
});

fs.readFile('scripts/main.js', (error, content) => {
    console.log(content);
});

fs.readFile('scripts/navbar.js', (error, content) => {
    console.log(content);
});

app.get('/register', (req, res) => {
    res.render('pages/register');
});

app.get('/login', (req, res) => {
    res.render('pages/login');
});

app.get('/community-rules', requireAuth, (req, res) => {
    res.render('pages/community-rules');
});

app.get('/nothing', requireAuth, (req, res) => {
  res.json({ message: 'This is a private route' });  
});

app.get('/logout', (req, res, next) => {
  req.session.destroy(() => {
    res.redirect('/login')
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
