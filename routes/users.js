import express from 'express';
import bcrypt from 'bcrypt';
import User from '../db/models/User.js';

const userRoute = express.Router();

//UPDATE
userRoute.put("/:id", async (req, res) => {
    if(req.params.id === req.body.userId || req.body.isAdmin){
        if(req.body.password){
            try {
                const salt = bcrypt.genSaltSync(10);
                req.body.password = bcrypt.hashSync(req.body.password, salt);

            } catch (err) {
                res.status(500).json(err);
                return;
            }
        }
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body 
            });
            res.status(200).json("User updated");
        } catch (err) {
            res.status(500).json(err);
            return;
        }
    }
    else{
        res.status(403).json("You are not authorized to update this user");
        return;
    }
});

//DELETE
userRoute.delete("/:id", async (req, res) => {
    if(req.params.id === req.body.userId || req.body.isAdmin){
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            res.status(200).json("User deleted");
        } catch (err) {
            res.status(500).json(err);
            return;
        }
    }
    else{
        res.status(403).json("You are not authorized to delete this user");
        return;
    }
});

//GET
userRoute.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        console.log(user._doc);
        const {password, updatedAt, ...other} = user._doc;
        res.status(200).json(other);
    } catch (err) {
        res.status(500).json(err);
        return;
    }
});

export default userRoute;