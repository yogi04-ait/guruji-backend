import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
})

// `unique: true` is declared on the schema path; avoid duplicate index declarations

userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: "10d"
    });
}


userSchema.methods.validatePassword = function (password) {
    return bcrypt.compare(password, this.password);
}

const User = mongoose.model('User', userSchema);
export default User;

