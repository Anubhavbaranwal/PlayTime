import mongoose, { Schema } from "mongoose";
import bycrpt from "bcrypt";
import  Jwt  from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    Email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    FullName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String, //cloudinary url
      required: true,
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is Required"],
    },
    RefreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = bycrpt.hash(this.password, 10);
  }
  next();
});
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bycrpt.compare(password, this.password);
};
user.methods.genreateAccessToken=function(){
    return Jwt.sign({
        _id:this._id,
        username:this.username,
        FullName:this.FullName,
        Email:this.Email
    },process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    })
}
user.methods.genreateRefreshToken=function(){
    return Jwt.sign({
        _id:this._id,
    },process.env.REFRESH_TOKEN_SECRET,{
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    })
}
export const user = mongoose.model("Users", userSchema);
