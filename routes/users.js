var secrets = require('../config/secrets');
var User = require('../models/user');
var mongoose = require('mongoose');

module.exports = function (router) {
    var userRouter = router.route('/users');
    var userIdRouter = router.route('/users/:id');

    /* ENDPOINT - users */

    /* GET - Respond with a List of users */
    userRouter.get(function (req, res) {
        let filters = User.find();

        if(req.query.where) filters.where(JSON.parse(req.query.where));
        if(req.query.sort) filters.sort(JSON.parse(req.query.sort));
        if(req.query.select) filters.select(JSON.parse(req.query.select));
        if(req.query.skip) filters.skip(JSON.parse(req.query.skip));
        if(req.query.limit) filters.limit(JSON.parse(req.query.limit));
        if(req.query.count) filters.count(JSON.parse(req.query.count));

        filters.exec(function(err, users){
            if(err){
                res.status(404).send({ message: "ERROR: Cannot Find Users" , data: err });
            } else if(users.length === 0){
                res.status(404).json({ message: "ERROR: No Users Found", data: null });
            } else {
                res.status(200).json({ message: "OK.", data: users });
            }
        });
    });

    /* POST - Create a new user. Respond with details of new user */
    userRouter.post(function (req, res) {
        var validPost = true;

        // added isRequired to name and email in UserSchema, these might not even run
        if(req.body.name === ''){
            res.status(500).json({ message: "ERROR: You must input a valid name" });
            validPost = false;
        }
        if(req.body.email === ''){
            res.status(500).json({ message: "ERROR: You must input a valid email" });
            validPost = false;
        }

        User.find(function(err, users){
            let emails = [];
            users.forEach(function(user){
                emails.push(user.email);
            })
            if(emails.includes(req.body.email)){
                res.status(500).json({ message: "ERROR: That email is already used", data: req.body.email});
                validPost = false;
            }
        });

        if(validPost){
            let newUser = new User();
            newUser.name = req.body.name;
            newUser.email = req.body.email;
            newUser.pendingTasks = [];
            newUser.save(function(err){
                if(err){
                    res.status(500).send({ message: "ERROR: Could Not Create New User", data: err });
                } else {
                    res.status(201).json({ message: "OK: New User Created", data: newUser });
                }
            });
        }
    });


    /* ENDPOINT - users/:id */

    /* GET - Respond with details of specified user or 404 error */
    userIdRouter.get(function (req, res) {
        User.findById(new mongoose.Types.ObjectId(req.params.id), function(err, user){
            if(err) {
                res.status(404).send({ message: "ERROR: Could Not Find Given User" , data: err });
            } else if(user === null){
                res.status(404).json({ message: "ERROR: No Such Given User", data: null });
            } else {
                res.status(200).json({ message: "OK.", data: user })
            }
        })
    });

    /* PUT - Replace entire user with supplied user or 404 error */
    userIdRouter.put(function (req, res) {
        /* userTasks becomes null on empty upddate */
        // let updatedUser = new User();
        // updatedUser['_id'] = mongoose.Types.ObjectId(req.params.id);
        // updatedUser.name = req.body.name;
        // updatedUser.email = req.body.email;
        // updatedUser.pendingTasks = req.body.pendingTasks;
        // User.findByIdAndUpdate(mongoose.Types.ObjectId(req.params.id), updatedUser, {new: true}, function(err, user){
            // if(err){
            //     res.status(404).send({ message: "ERROR: Could Not Update Given User", data: err });
            // } else {
            //     res.status(200).json({ message: "OK: User Updated", data: updatedUser });
            // }
        // });

        User.findById(new mongoose.Types.ObjectId(req.params.id), function(err, updatedUser){
            if(err) {
                res.status(404).send({ message: "ERROR: Could Not Find Given User" , data: err });
            } else if(updatedUser === null){
                res.status(404).json({ message: "ERROR: No Such Given User", data: null });
            } else {
                updatedUser.name = req.body.name;
                updatedUser.email = req.body.email;
                updatedUser.pendingTasks = req.body.pendingTasks;
                updatedUser.save(function(err){
                    if(err){
                        res.status(404).send({ message: "ERROR: Could Not Update Given User", data: err });
                    } else {
                        res.status(200).json({ message: "OK: User Updated", data: updatedUser });
                    }
                });
            }
        });
    });

    /* DELETE - Delete specified user or 404 error */
    userIdRouter.delete(function (req, res) {
        // User.remove({ _id: new mongoose.Types.ObjectId(req.params.id) }, function (err) {
        //     if(err){
        //         res.send(err);
        //     } else {
        //         res.status(200).json({ message: "User Deleted" });
        //     }
        // });
        User.findByIdAndRemove(new mongoose.Types.ObjectId(req.params.id), function(err, user){
            if(err){
                res.send({ message: "ERROR: Could Not Delete Given User", data: err });
            } else if(user === null) {
                res.status(404).json({ message: "ERROR: No Such Given User", data: null });
            } else {
                res.status(200).json({ message: "OK: User Deleted" });
            }
        });
    });

    return router;
}
