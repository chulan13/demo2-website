const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcrypt');
const passportLocalMongoose = require('passport-local-mongoose');


// mongoose.connect("mongodb+srv://sveethuu:LdR7KyynEjbNwFy3@cluster0.unoyisx.mongodb.net/test?retryWrites=true&w=majority")
// .then(() => {
//     console.log('mongoose.connected');
// })
// .catch((e) => {
//     console.log('fuck you');
//     console.log(e.reason);
// })

const logInSchema = new mongoose.Schema({
    name: {
        type:String,
        required:true,
        unique:true,
        uniqueCaseInsensitive: true,
        index: { unique: true}
    },
    password: {
        type:String,
        required:true
    }
})

// Hash the password before saving it 

logInSchema.plugin(passportLocalMongoose);
logInSchema.plugin(uniqueValidator);
const LogInCollection=new mongoose.model('users',logInSchema)

module.exports=LogInCollection