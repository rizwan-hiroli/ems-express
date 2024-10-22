const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const app = express();
const port = 4000;

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB.
mongoose.connect('mongodb://localhost:27017/crud_db')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));


// Define a simple schema and model for the "Item"
const employeeSchema = new mongoose.Schema({
    emp_name: { type: String, required: true },
    emp_email: { type: String, required: true },
    emp_salary: { type: String, required: true },
    experience: { type: String, required: true },
    dept_code: { type: String, required: true },
    joining_date: { type: String, required: true },
    secrete_code: { type: String, required: true }
});
const Employee = mongoose.model('Employee', employeeSchema);

// Create (POST)
app.post('/employees',
    [
        // Validation rules
        body('emp_name').isString().withMessage('Employee name must be a string').notEmpty().withMessage('Employee name is required'),
        body('emp_email').isEmail().withMessage('Invalid email format').notEmpty().withMessage('Employee email is required'),
        body('emp_salary').isNumeric().withMessage('Salary must be a number').notEmpty().withMessage('Employee salary is required'),
        body('experience').isInt({ min: 0 }).withMessage('Experience must be a non-negative integer'),
        body('dept_code').isString().withMessage('Department code must be a string').notEmpty().withMessage('Department code is required'),
        body('joining_date').isISO8601().withMessage('Joining date must be a valid date in ISO8601 format'),
        body('secrete_code').isString().withMessage('Secret code must be a string').notEmpty().withMessage('Secret code is required')
    ]
    , async (req, res) => {

        // Find validation errors in the request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const employee = new Employee({
            emp_name: req.body.emp_name,
            emp_email: req.body.emp_email,
            emp_salary: req.body.emp_salary,
            experience: req.body.experience,
            dept_code: req.body.dept_code,
            joining_date: req.body.joining_date,
            secrete_code: req.body.secrete_code,
        });

        try {
            const savedEmployee = await employee.save();
            res.status(201).json(savedEmployee);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
});

// Read (GET) - fetch all employees
app.get('/employees', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Read (GET) - fetch item by id
app.get('/employees/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.json(employee);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update (PUT)
app.put('/employees/:id', 
    [
        // Validation rules
        body('emp_name').isString().withMessage('Employee name must be a string').notEmpty().withMessage('Employee name is required'),
        body('emp_email').isEmail().withMessage('Invalid email format').notEmpty().withMessage('Employee email is required'),
        body('emp_salary').isNumeric().withMessage('Salary must be a number').notEmpty().withMessage('Employee salary is required'),
        body('experience').isInt({ min: 0 }).withMessage('Experience must be a non-negative integer'),
        body('dept_code').isString().withMessage('Department code must be a string').notEmpty().withMessage('Department code is required'),
        body('joining_date').isISO8601().withMessage('Joining date must be a valid date in ISO8601 format'),
        body('secrete_code').isString().withMessage('Secret code must be a string').notEmpty().withMessage('Secret code is required')
    ],
    async (req, res) => {
        
        // Find validation errors in the request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        try {
            const employee = await Employee.findById(req.params.id);
            if (!employee) return res.status(404).json({ message: 'Employee not found' });
            employee.emp_name = req.body.emp_name;
            employee.emp_email = req.body.emp_email;
            employee.emp_salary = req.body.emp_salary;
            employee.experience = req.body.experience;
            employee.dept_code = req.body.dept_code;
            employee.joining_date = req.body.joining_date;
            employee.secrete_code = req.body.secrete_code;
            const updatedEmployee = await employee.save();
            res.json(updatedEmployee);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
});

// Delete (DELETE)
app.delete('/employees/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        await employee.deleteOne();
        res.json({ message: 'Employee deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete (DELETE)
app.get('/employees/search/:name', async (req, res) => {
    const name = req.params.name;  // Retrieve the search term from the query string
    try {
        // Use a case-insensitive regular expression to search for the name
        Employee.find({ emp_name: { $regex: name, $options: 'i' } })
                .then(employees => {
                    if (employees.length === 0) {
                        return res.status(404).json({ message: 'No employees found' });
                    }
                    res.json(employees);
                })
                .catch(err => res.status(500).json({ error: err.message }));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
