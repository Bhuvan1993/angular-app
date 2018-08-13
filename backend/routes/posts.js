const express = require('express');

const Post = require('../models/post');

const multer = require('multer');

const MIME_TYPE_MAP = {
  'image/png' : 'png',
  'image/jpeg' : 'jpg',
  'image/jpg' : 'jpg',
};

const storage = multer.diskStorage({
  //multer executes this when its trying to save the file
  destination : (req, file, callback) => {
    console.log("file from destination :" + file);
    console.log(file.mimetype);
    const isValid = MIME_TYPE_MAP[file.mimetype];
    console.log(isValid);
    let error = new Error("Invalid mime type");
    if(isValid) {
      error = null;
    }
    // where to store it relative to server js file and error specify any errors
    callback(error,"backend/images");
  },
  filename : (req, file, callback) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const extension = MIME_TYPE_MAP[file.mimetype];
    //null specifies  that there are no errors
    callback(null, name + '-' + Date.now() + '.' + extension);
  }
});

const router = express.Router();


// express makes sure that all these instructions run from left to right in order
// first it parses the url, next executes multer and then function
//we are letting multer know that we will receive single file from incoming request on image property

router.post("", multer({storage : storage}).single("image"), (req, res, next) => {

  const url = req.protocol + "://" + req.get("host");
  //new body added by body parser
  // const post = req.body;
  const post = new Post({
    title : req.body.title,
    content : req.body.content,
    imagePath: url + "/images/" + req.file.filename

  });
  post.save().then(
    createdPost => {

      res.status(201).json(
        {
          postResponse : createdPost,
          message: "post added successfully"
        }
      );
    }
  );
  console.log(post);

});


//put a new resource and completely replace old one with it
// router.put()



router.put("/:id",multer({storage : storage}).single("image"), (req, res, next) => {

  console.log("req file params in put : " + req.file);
  console.log("req param file path : "+req.body.imagePath);
  let imagePath = req.body.imagePath;

  if(req.file ) {
    //if we have a file in the input request, then store it from form data
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/images/" + req.file.filename;
  }
   const post = new Post({
      _id: req.params.id,
      title: req.body.title,
      content: req.body.content,
      imagePath : imagePath,
    });

  console.log(post);
  console.log("postid:" + req.params.id);
  Post.updateOne({_id: req.params.id}, post).then(
    result => {
      console.log(result);
      res.status(200).json({message : 'update successful', post : result});
    }
  ).catch(ex =>console.log(ex));
});



//update an exisiting resource with new values
// router.patch()

router.get('', (req, res,next) => {
  console.log("query params : " + req.query);
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;

  const postQuery = Post.find();
  let fetchedPosts;
  if(pageSize && currentPage) {
    //this approach doesnt work for large data sets as it loads all data into memory and peforms filtering
    postQuery.skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  postQuery
    .then(documents => {
      fetchedPosts = documents;
      return Post.count();
    }).then(count => {
    return res.status(200).json({
      message : 'posts send successfully',
      posts : fetchedPosts,
      totalPosts : count
    });
  })
    .catch();
  const posts = [{
    id: "121",
    title : "title 1",
    content : "content 1 from node",
  },
    {
      id: "122",
      title : "title 2 ",
      content : "content 2 from node",
    }

  ];

  // res.send('hello from exprsss');
});

router.get('/:id', (req, res,next) => {
  Post.findById(req.params.id).then(post => {
    if(post) {
      res.status(200).json({
        message : 'posts send successfully',
        post : post
      });
    } else {
      res.status(404).json({
        message : 'post not found'
      });
    }
  })
    .catch(ex => console.log(ex));

});


router.delete('/:id', (req, res, next)=> {
  console.log("deleting post id: " + req.params.id);
  Post.deleteOne({_id : req.params.id}).then( result => {
      console.log(result);
      res.status(200).json({message: 'post deleted'});
    }
);
});

module.exports = router;
