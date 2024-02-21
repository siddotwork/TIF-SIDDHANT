const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;
app.use(bodyParser.json());

const startRoutes = require('./routes/signup');
const roleRoutes=require('./routes/roles');
const communityRoutes=require('./routes/community');
const memberRoutes=require('./routes/members');

app.use('/v1/auth',startRoutes)
app.use('/v1/role',roleRoutes)
app.use('/v1/community',communityRoutes)
app.use('/v1/member',memberRoutes)

mongoose.connect("mongodb://localhost:27017/CrazeCommunity", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB', err));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
