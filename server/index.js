const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const User = require('./models/user.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

app.use(cors())
app.use(express.json())
//mongoose.connect('mongodb://localhost:27017/WDProject')

//this works for me
mongoose.connect('mongodb://127.0.0.1:27017/WDProject', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


// mongoose.connect('mongodb://localhost:27017/WDProject', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   poolSize: 10, // Adjust the pool size as needed
// });


// app.get('/hello', (req,res) => {
//     res.send('hello world')
// })



//Register
app.post('/api/register', async (req, res) => {
	console.log(req.body);
  
	try {
	  // Hash the user's password securely.
	  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  
	  // Create a new user with the hashed password.
	  const user = await User.create({
		name: req.body.name,
		email: req.body.email,
		password: hashedPassword,
	  });
  
	  res.json({ status: 'ok' });
	} catch (err) {
	  if (err.code === 11000) {
		// Handle duplicate email error separately.
		res.status(400).json({ status: 'error', error: 'Email already exists' });
	  } else {
		res.status(500).json({ status: 'error', error: 'Registration failed' });
	  }
	}
  });
  
  //Login
  app.post('/api/login', async (req, res) => {
    const user = await User.findOne({
        email: req.body.email,
    })

    if (!user) {
        return res.json({ status: 'error', error: 'Invalid login' })
    }

    const isPasswordValid = await bcrypt.compare(
        req.body.password,
        user.password
    )

    if (isPasswordValid) {
        const token = jwt.sign(
            {
                name: user.name,
                email: user.email,
            },
            'secret123'
        )

        return res.json({ status: 'ok', message : "Successful Login, Welcome!", user: token})
    } else {
        return res.json({ status: 'error', error: 'Login failed' })
    }
})

  

app.get('/api/quote', async (req, res) => {
	const token = req.headers['x-access-token']

	try {
		const decoded = jwt.verify(token, 'secret123')
		const email = decoded.email
		const user = await User.findOne({ email: email })

		return res.json({ status: 'ok', quote: user.quote })
	} catch (error) {
		console.log(error)
		res.json({ status: 'error', error: 'invalid token' })
	}
})

app.post('/api/quote', async (req, res) => {
	const token = req.headers['x-access-token']

	try {
		const decoded = jwt.verify(token, 'secret123')
		const email = decoded.email
		await User.updateOne(
			{ email: email },
			{ $set: { quote: req.body.quote } }
		)

		return res.json({ status: 'ok' })
	} catch (error) {
		console.log(error)
		res.json({ status: 'error', error: 'invalid token' })
	}
})


app.listen(3001, () =>{
    console.log('Server Started on 3001')
})