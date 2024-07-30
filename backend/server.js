const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 3000;

const indexRouter = require('./routes/index');
const productionRouter = require('./routes/production');
const inventoryRouter = require('./routes/inventory');

app.use(morgan('dev'));
app.use(bodyParser.json());

app.use('/', indexRouter);
app.use('/production', productionRouter);
app.use('/inventory', inventoryRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

