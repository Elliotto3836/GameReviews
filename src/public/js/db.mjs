import mongoose from 'mongoose';
import mongooseSlugPlugin from 'mongoose-slug-plugin';
import dotenv from 'dotenv';

dotenv.config();


console.log("DSN: ");
console.log(process.env.DSN);

mongoose.connect(process.env.DSN);

const UserSchema = new mongoose.Schema({
  username: {type: String, required: true},
  password: {type: String, required: true},
  email: {type: String, required: true},
}, {timestamps: true});


const ReviewSchema = new mongoose.Schema({
  title: {type: String, required: true},
  platforms: {type: String, required: true},
  developer: {type: String, required: false},
  body: {type: String, required: true},
  score: {type: Number, required: true},
  time : {type:Number, required:true},
  author: { type:String, required: true }

}, {timestamps: true});



UserSchema.plugin(mongooseSlugPlugin, {tmpl: '<%=username%>'});
ReviewSchema.plugin(mongooseSlugPlugin, {tmpl: '<%=title%>'});

export const User = mongoose.model('User', UserSchema);
export const Review = mongoose.model('Review', ReviewSchema);
