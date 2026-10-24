require('node:dns').setServers(['8.8.8.8', '8.8.4.4']);
// Task1: initiate app and run server at 3000

const express = require('express');
const mongoose = require('mongoose');
const path=require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist', 'Frontend')));
// Task2: create mongoDB connection 

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    salary: { type: Number, required: true }
});

const Employee = mongoose.model('Employee', employeeSchema);

//Task 2 : write api with error handling and appropriate api mentioned in the TODO below

const employeeRouter = express.Router();

//TODO: get data from db  using api '/api/employeelist'

employeeRouter.get('/employeelist', async (req, res, next) => {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (error) {
        next(error);
    }
});


//TODO: get single data from db  using api '/api/employeelist/:id'

employeeRouter.get('/employeelist/:id', async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: 'Invalid employee id' });
        }
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.json(employee);
    } catch (error) {
        next(error);
    }
});


//TODO: send data from db using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}

employeeRouter.post('/employeelist', async (req, res, next) => {
    try {
        const employee = await Employee.create({
            name: req.body.name,
            location: req.body.location,
            position: req.body.position,
            salary: req.body.salary
        });
        res.status(201).json(employee);
    } catch (error) {
        next(error);
    }
});


//TODO: delete a employee data from db by using api '/api/employeelist/:id'


employeeRouter.delete('/employeelist/:id', async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: 'Invalid employee id' });
        }
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.json({ message: 'Employee deleted', employee });
    } catch (error) {
        next(error);
    }
});


//TODO: Update  a employee data from db by using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}

const updateEmployee = async (req, res, next) => {
    try {
        const body = req.body || {};
        const id = req.params.id || body._id || body.id;
        if (!id || !mongoose.isValidObjectId(id)) {
            return res.status(400).json({ error: 'A valid employee id is required' });
        }
        const updates = {};
        for (const field of ['name', 'location', 'position', 'salary']) {
            if (Object.prototype.hasOwnProperty.call(body, field)) {
                updates[field] = body[field];
            }
        }
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'At least one employee field is required' });
        }
        const employee = await Employee.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.json(employee);
    } catch (error) {
        next(error);
    }
};

employeeRouter.put('/employeelist', updateEmployee);
employeeRouter.put('/employeelist/:id', updateEmployee);

app.use('/api', employeeRouter);
app.use('/', employeeRouter);

app.use((error, req, res, next) => {
    console.error(error);
    if (error.name === 'ValidationError' || error.name === 'CastError' || error instanceof SyntaxError) {
        return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
});

//! dont delete this code. it connects the front end file.
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'dist', 'Frontend', 'index.html'));
});

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    console.error('Set MONGODB_URI to your MongoDB Atlas connection string.');
    process.exitCode = 1;
} else {
    mongoose.connect(mongoUri)
        .then(() => {
            app.listen(3000, () => console.log('Server listening on port 3000'));
        })
        .catch((error) => {
            console.error('MongoDB connection failed:', error);
            process.exitCode = 1;
        });
}
