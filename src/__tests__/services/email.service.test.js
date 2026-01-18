const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'your-email@gmail.com',
			pass: 'your-password'
		}
	});

	const mailOptions = {
		from: 'your-email@gmail.com',
		to,
		subject,
		text
	};

	return transporter.sendMail(mailOptions);
};

test('sendEmail sends an email', async () => {
	const response = await sendEmail('test@example.com', 'Test Subject', 'Test Body');
	expect(response).toHaveProperty('accepted');
	expect(response.accepted).toContain('test@example.com');
});