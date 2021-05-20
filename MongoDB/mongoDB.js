const mongoose = require("mongoose");

const uri = "mongodb+srv://Harsh:Password@cluster0.iqanv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

module.exports.connect = () => {
  mongoose.connect(uri, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
    .then(() => console.log('Connected to MongoDB...'));
};
