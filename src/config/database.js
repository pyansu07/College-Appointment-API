const mongoose = require('mongoose');

const connectDB = async (uri) => {
    try{
        await mongoose.connect(uri, {
            useNewUrlParser:true,
            useUnifiedTopology:true
        });
        console.log('MongoDB connected successfully');
    }
    catch (error){
        console.error('MongoDB connection error:',error);
    }
};

module.exports = connectDB;