const crypto = require('node:crypto')
const cors = require('cors')
const dotenv = require('dotenv')
const express = require('express')
const mongoose = require('mongoose')
const nodemailer = require('nodemailer')

dotenv.config()

const app = express()
const port = Number(process.env.PORT) || 5001
const adminEmail = process.env.ADMIN_EMAIL
const adminPassword = process.env.ADMIN_PASSWORD
const contactEmail = process.env.CONTACT_EMAIL || 'alamfarhan3304@gmail.com'
const sessions = new Map()
const defaultProductImage = 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=600&q=80'

app.use(cors())
app.use(express.json())

const productSchema = new mongoose.Schema({
	name: { type: String, required: true, trim: true },
	category: { type: String, required: true, trim: true },
	price: { type: Number, required: true, min: 0 },
	stock: { type: Number, required: true, min: 0 },
	image: { type: String, default: defaultProductImage },
}, { timestamps: true })

const Product = mongoose.model('Product', productSchema)

const requireAdmin = (req, res, next) => {
	const token = req.get('authorization')?.replace(/^Bearer\s+/i, '')
	const expiresAt = sessions.get(token)

	if (!token || !expiresAt || expiresAt < Date.now()) {
		sessions.delete(token)
		return res.status(401).json({ message: 'Please log in as an admin.' })
	}

	next()
}

const requireDatabase = (req, res, next) => {
	if (mongoose.connection.readyState !== 1) {
		return res.status(503).json({ message: 'Database is unavailable. Check MONGODB_URI.' })
	}

	next()
}

app.get('/api/health', (req, res) => {
	res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' })
})

app.get('/api/products', requireDatabase, async (req, res, next) => {
	try {
		const products = await Product.find().sort({ createdAt: -1 })
		res.json(products.map((product) => ({
			...product.toObject(),
			image: product.image || defaultProductImage,
		})))
	} catch (error) {
		next(error)
	}
})

app.post('/api/contact', async (req, res, next) => {
	const { name, email, topic, message } = req.body || {}
	const fields = [name, email, topic, message]
	if (!fields.every((field) => typeof field === 'string' && field.trim())) {
		return res.status(400).json({ message: 'Complete all contact form fields.' })
	}

	const contact = {
		name: name.trim(),
		email: email.trim(),
		topic: topic.trim(),
		message: message.trim(),
	}
	if (contact.name.length > 120
		|| contact.email.length > 254
		|| contact.topic.length > 120
		|| contact.message.length > 5000
		|| !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
		return res.status(400).json({ message: 'Check your contact details and try again.' })
	}

	const smtpUser = process.env.SMTP_USER?.trim()
	const smtpPassword = process.env.SMTP_PASSWORD?.trim()
	if (!smtpUser
		|| !smtpPassword
		|| smtpUser === 'your-sender@gmail.com'
		|| smtpPassword === 'your-gmail-app-password') {
		return res.status(503).json({
			message: 'Gmail is not connected yet. Set SMTP_USER to your Gmail address and SMTP_PASSWORD to its Google App Password in backend/.env, then restart the backend.',
		})
	}

	const smtpPort = Number(process.env.SMTP_PORT) || 465
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		port: smtpPort,
		secure: process.env.SMTP_SECURE
			? process.env.SMTP_SECURE === 'true'
			: smtpPort === 465,
		auth: { user: smtpUser, pass: smtpPassword.replace(/\s/g, '') },
	})

	try {
		await transporter.sendMail({
			from: `"MediCare Contact" <${smtpUser}>`,
			to: contactEmail,
			replyTo: contact.email,
			subject: `[MediCare] ${contact.topic} — message from ${contact.name.replace(/[\r\n]/g, ' ')}`,
			text: `Name: ${contact.name}\nEmail: ${contact.email}\nTopic: ${contact.topic}\n\n${contact.message}`,
		})
		res.status(200).json({ message: 'Your message has been sent. Thank you for contacting MediCare.' })
	} catch (error) {
		console.error('Contact email delivery failed:', {
			code: error.code,
			responseCode: error.responseCode,
		})

		if (error.code === 'EAUTH' || error.responseCode === 535) {
			return res.status(502).json({
				message: 'Gmail rejected the SMTP login. Check that SMTP_USER is your Gmail address and SMTP_PASSWORD is a current Google App Password (not your regular password).',
			})
		}

		if (['ECONNECTION', 'ETIMEDOUT', 'ENOTFOUND'].includes(error.code)) {
			return res.status(502).json({
				message: 'Could not connect to Gmail. Check your internet connection and try again.',
			})
		}

		return res.status(502).json({
			message: 'Gmail could not send your message. Check the SMTP setup in backend/.env and try again.',
		})
	}
})

app.post('/api/admin/login', (req, res) => {
	const { email, password } = req.body || {}

	if (!adminEmail || !adminPassword) {
		return res.status(503).json({ message: 'Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env.' })
	}

	if (email !== adminEmail || password !== adminPassword) {
		return res.status(401).json({ message: 'Invalid email or password.' })
	}

	const token = crypto.randomBytes(32).toString('hex')
	sessions.set(token, Date.now() + 8 * 60 * 60 * 1000)
	res.json({ token })
})

app.get('/api/admin/products', requireAdmin, requireDatabase, async (req, res, next) => {
	try {
		const products = await Product.find().sort({ createdAt: -1 })
		res.json(products)
	} catch (error) {
		next(error)
	}
})

app.post('/api/admin/products', requireAdmin, requireDatabase, async (req, res, next) => {
	try {
		const product = await Product.create(req.body)
		res.status(201).json(product)
	} catch (error) {
		if (error.name === 'ValidationError' || error.name === 'CastError') {
			return res.status(400).json({ message: error.message })
		}
		next(error)
	}
})

app.patch('/api/admin/products/:id', requireAdmin, requireDatabase, async (req, res, next) => {
	try {
		const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		})

		if (!product) {
			return res.status(404).json({ message: 'Product not found.' })
		}

		res.json(product)
	} catch (error) {
		if (error.name === 'ValidationError' || error.name === 'CastError') {
			return res.status(400).json({ message: error.message })
		}
		next(error)
	}
})

app.delete('/api/admin/products/:id', requireAdmin, requireDatabase, async (req, res, next) => {
	try {
		const product = await Product.findByIdAndDelete(req.params.id)

		if (!product) {
			return res.status(404).json({ message: 'Product not found.' })
		}

		res.sendStatus(204)
	} catch (error) {
		if (error.name === 'CastError') {
			return res.status(400).json({ message: 'Invalid product ID.' })
		}
		next(error)
	}
})

app.use((error, req, res, next) => {
	console.error(error)
	res.status(500).json({ message: 'An unexpected server error occurred.' })
})

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medicine_store'
mongoose.connect(mongoUri).then(async () => {
	const catalogSeedKey = 'initial_storefront_catalog_v1'
	const catalogSeedCollection = mongoose.connection.collection('catalog_seeds')
	const catalogSeed = await catalogSeedCollection.findOne({ _id: catalogSeedKey })

	if (!catalogSeed) {
		const defaultProducts = [
			{ name: 'Paracetamol', category: 'Fever', price: 45, stock: 120, image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=600&q=80' },
			{ name: 'Cefixime', category: 'Fever', price: 120, stock: 85, image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80' },
			{ name: 'Ibuprofen', category: 'Fever', price: 90, stock: 90, image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=600&q=80' },
			{ name: 'Combo Syrup', category: 'Fever', price: 150, stock: 70, image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80' },
			{ name: 'Fever Relief', category: 'Fever', price: 130, stock: 65, image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=600&q=80' },
			{ name: 'Cough Syrup', category: 'Cough', price: 110, stock: 70, image: 'https://images.unsplash.com/photo-1582793987084-9a7e9d8bf3f6?auto=format&fit=crop&w=600&q=80' },
			{ name: 'Menthol Lozenges', category: 'Cough', price: 60, stock: 100, image: 'https://images.unsplash.com/photo-1528747045269-390fe33c19f2?auto=format&fit=crop&w=600&q=80' },
			{ name: 'Expectorant', category: 'Cough', price: 140, stock: 60, image: 'https://images.unsplash.com/photo-1550572017-7d3a3d5f1c36?auto=format&fit=crop&w=600&q=80' },
			{ name: 'Lung Relief', category: 'Cough', price: 175, stock: 55, image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=600&q=80' },
			{ name: 'Honey Cough', category: 'Cough', price: 95, stock: 75, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80' },
			{ name: 'Vitamin C', category: 'General', price: 80, stock: 150, image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=600&q=80' },
			{ name: 'Calcium Plus', category: 'General', price: 160, stock: 95, image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80' },
			{ name: 'Multivitamin', category: 'General', price: 210, stock: 80, image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80' },
			{ name: 'Energy Boost', category: 'General', price: 185, stock: 65, image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80' },
			{ name: 'Immune Care', category: 'General', price: 200, stock: 90, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80' },
		]

		await Product.bulkWrite(defaultProducts.map((product) => ({
			updateOne: {
				filter: { name: product.name },
				update: { $setOnInsert: product },
				upsert: true,
			},
		})))
		await catalogSeedCollection.insertOne({ _id: catalogSeedKey, completedAt: new Date() })
		console.log('Initialized the storefront catalog.')
	}
}).catch((error) => {
	console.error(`MongoDB initialization failed: ${error.message}`)
})

app.listen(port, () => {
	console.log(`Medicine store API listening on port ${port}`)
})