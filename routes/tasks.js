var secrets = require('../config/secrets');
var Task = require('../models/task');
var mongoose = require('mongoose');

module.exports = function (router) {
    var taskRouter = router.route('/tasks');
    var taskIdRouter = router.route('/tasks/:id');

    /* ENDPOINT - tasks */

    /* GET - Respond with a List of tasks */
    taskRouter.get(function (req, res) {
        let filters = Task.find();

        if(req.query.where) filters.where(JSON.parse(req.query.where));
        if(req.query.sort) filters.sort(JSON.parse(req.query.sort));
        if(req.query.select) filters.select(JSON.parse(req.query.select));
        if(req.query.skip) filters.skip(JSON.parse(req.query.skip));
        if(req.query.limit) filters.limit(JSON.parse(req.query.limit));
        if(req.query.count) filters.count(JSON.parse(req.query.count));

        filters.exec(function(err, tasks){
            if(err){
                res.status(404).send({ message: "ERROR: Unable to Get Tasks" , data: err });
            } else if(tasks.length === 0){
                res.status(404).json({ message: "ERROR: No Tasks Found", data: null });
            } else {
                res.status(200).json({ message: "OK.", data: tasks });
            }
        });
    });

    /* POST - Create a new task. Respond with details of new task */
    taskRouter.post(function (req, res) {
        var validPost = true;

        // added isRequired to name and deadline in TaskSchema, these might not even run
        if(req.body.name === ''){
            res.status(500).json({ message: "ERROR: You must input a valid name", data: null });
            validPost = false;
        }
        if(req.body.deadline === null){
            res.status(500).json({ message: "ERROR: You must set a valid deadline", data: null });
            validPost = false;
        }

        if(validPost){
            let newTask = new Task();
            newTask.name = req.body.name;
            newTask.description = req.body.description;
            newTask.deadline = req.body.deadline;
            newTask.completed = req.body.completed;
            newTask.assignedUser = req.body.assignedUser;
            newTask.assignedUserName = req.body.assignedUserName;
            newTask.dateCreated = req.body.dateCreated;
            newTask.save(function(err){
                if(err){
                    res.status(500).send({ message: "ERROR: Unable to Create Task", data: err });
                } else {
                    res.status(201).json({ message: "OK: New Task Created", data: newTask });
                }
            });
        }
    });


    /* ENDPOINT - tasks/:id */

    /* GET - Respond with details of specified task or 404 error */
    taskIdRouter.get(function (req, res) {
        Task.findById(new mongoose.Types.ObjectId(req.params.id), function(err, task){
            if(err) {
                res.status(404).send({ message: "ERROR: Could Not Find Given Task" , data: err });
            } else if(task === null){
                res.status(404).json({ message: "ERROR: No Such Task", data: null });
            } else {
                res.status(200).json({ message: "OK.", data: task })
            }
        })
    });

    /* PUT - Replace entire task with supplied task or 404 error */
    taskIdRouter.put(function (req, res) {
        Task.findById(new mongoose.Types.ObjectId(req.params.id), function(err, updatedTask){
            if(err) {
                res.status(404).send({ message: "ERROR: Could Not Find Given Task", data: err });
            } else if(updatedTask === null){
                res.status(404).json({ message: "ERROR: No Such Task to Update", data: null });
            } else {
                updatedTask.name = req.body.name;
                updatedTask.description = req.body.description;
                updatedTask.deadline = req.body.deadline;
                updatedTask.completed = req.body.completed;
                updatedTask.assignedUser = req.body.assignedUser;
                updatedTask.assignedUserName = req.body.assignedUserName;
                updatedTask.dateCreated = req.body.dateCreated;
                updatedTask.save(function(err){
                    if(err){
                        res.status(404).send({ message: "ERROR: Could Not Replace Given Task", data: err });
                    } else {
                        res.status(200).json({ message: "OK: Task Updated", data: updatedTask });
                    }
                });
            }
        });
    });

    /* DELETE - Delete specified task or 404 error */
    taskIdRouter.delete(function (req, res) {
        Task.findByIdAndRemove(new mongoose.Types.ObjectId(req.params.id), function(err, task){
            if(err){
                res.status(404).send({ message: "ERROR: Could Not Delete Given Task" , data: err });
            } else if(task === null) {
                res.status(404).json({ message: "ERROR: No Such Task to Delete", data: null});
            } else {
                res.status(200).json({ message: "OK: Task Deleted" });
            }
        });
    });

    return router;
}
