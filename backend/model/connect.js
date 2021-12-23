const mongoose = require('mongoose');

var options = {
    connectTimeoutMS: 5000,
    useNewUrlParser: true,
    useUnifiedTopology: true
}

// DB connection
mongoose.connect(process.env.DB_CONN,
    options,
    function (err) {
        console.log(err);
    }
);