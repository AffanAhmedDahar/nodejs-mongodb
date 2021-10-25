const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto')
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provie your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provie your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please write in email formate'],
  },
  photo: String,
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
  },
  password: {
    type: String,
    required: [true, 'Please provie password'],
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please provie confirm password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  active : {
   type : Boolean,
   default : true , 
   select: false
  },
  passwordChangedAt: Date,
  passwordResetToken : String,
  passwordResetExpires: Date,

});



userSchema.methods.matchPassword = async function(password){
  return await bcrypt.compare(password , this.password)
}

userSchema.pre('save', async function (next) {
  
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);

  this.confirmPassword = undefined;
});

userSchema.pre('save' , function(next) {
  if(!this.isModified || this.isNew) return next()

  this.passwordChangedAt = Date.now() - 1000
  next()
})

userSchema.pre(/^find/, function(next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// userSchema.pre(/^find/, function(next)
// {
//   this.find({active : {$ne : false}})
// }
// ) 
const User = mongoose.model('user', userSchema);

module.exports = User;
