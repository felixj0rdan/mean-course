const Post = require('../models/post')
const { json } = require("body-parser");

exports.createPost = (req, res, next) => {

    const url = req.protocol + "://" + req.get('host');
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: url + "/images/" + req.file.filename,
        creator: req.userData.userId,
    });
    post.save().then(createdPost => {
        // console.log(createdPost);
        res.status(201).json({
            message: 'Post added successfully.',
            post: {
                ...createdPost,
                id: createdPost._id,

            }

        });
    })
    .catch(error => {
        res.status(500).json({
            message: "Creating a post has failed!"
        })
    });

}

exports.updatePost = (req, res) => {

    // console.log(req.file);
    let imagePath = req.body.imagePath;
    if (req.file) {
        const url = req.protocol + "://" + req.get('host');
        imagePath = url + "/images/" + req.file.filename
    }
    const post = new Post({
        _id: req.body.id,
        title: req.body.title,
        content: req.body.content,
        imagePath: imagePath,
        creator: req.userData.userId
    })
    Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post)
        .then(result => {
            console.log(result);
            if(result.matchedCount > 0) {
                res.status(200).json({ message: "Update successful!" })
            } else {
                res.status(401).json({ message: "Not authorized!" })
            }
        })
        .catch(error => {
            res.status(500).json({
                message: "Couldn't update post!"
            })
        });
}

exports.getPosts = (req, res, next) => {
    console.log(req.query);
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    const postQuery = Post.find();
    let fetchedPosts;
    if(pageSize && currentPage){
        postQuery
        .skip(pageSize * (currentPage - 1))
        .limit(pageSize)
    }

    postQuery
        .then(documents => {
            // console.log(documents);
            fetchedPosts = documents;
            return Post.count();
        }).then(count => {
            res.status(200).json({
                message: 'Posts fetched',
                posts: fetchedPosts,
                maxPosts: count
            });
        })
        .catch(error => {
            res.status(500).json({
                message: "Fetching posts failed!"
            });
        });

}

exports.getPost = (req, res) => {
    Post.findById(req.params.id)
        .then(post => {
            if (post) {
                res.status(200).json(post);
            } else {
                res.status(404).json({ message: 'Post not found' });
            }
        })
        .catch(error => {
            res.status(500).json({
                message: "Fetching post failed!"
            });
        });
}

exports.deletePost = (req, res) => {
    Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
        .then((result) => {
            console.log(result);
            if(result.deletedCount > 0) {
                res.status(200).json({ message: "Deleted successfully!" })
            } else {
                res.status(401).json({ message: "Not authorized!" })
            }
        })
        .catch(error => {
            res.status(500).json({
                message: "Deleting post failed!"
            });
        });
}