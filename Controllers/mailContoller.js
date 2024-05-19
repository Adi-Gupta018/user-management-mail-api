const nodemailer = require('nodemailer');
const asyncHandler = require('express-async-handler');
require('dotenv').config();
const User = require('../db/Users');

// ... other code

const sendEmailToList = asyncHandler(async (req, res) => {
  try {
    const listId = req.params?.list_id; // Assuming listId is retrieved from the request URL
    const emailSubject = req.body.subject; // Assuming subject is sent in the request body
    const emailContent = req.body.content; // Assuming content is sent in the request body

    if (!listId || !emailSubject || !emailContent) {
      return res.status(400).json({ message: 'Missing required fields: listId, subject, or content' });
    }

    const fetchedUsers = await User.find({list:listId});

    if(!fetchedUsers || fetchedUsers.length === 0) return res.status(400).json({message:"List is empty"});

    

    const transporter = nodemailer.createTransport({
      // Configure your email sending service here (e.g., SMTP details)
      service:'gmail',
      host:"smtp.gmail.com",
      port:587,
      secure:false,
      auth:{
        user:process.env.APP_USER,
        pass:process.env.APP_PASSWORD,
      }
      
    });

    const emailsSent = [];
    const failedEmails = [];
    const errors = [];

    for (const user of fetchedUsers) {
      const mailOptions = {
        from: process.env.APP_USER,
        to: user.email,
        subject: emailSubject,
        html: emailContent, // Assuming HTML content
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        emailsSent.push(user.email);
      } catch (error) {
        console.error('Error sending email to user:', user.email, error);
        failedEmails.push(user.email);
        errors.push(error)
      }
    }

    const response = {
      message: `${emailsSent.length} emails sent successfully, ${failedEmails.length} failed`,
      emailsSent,
      failedEmails,
      errors,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error sending email to list:', error);
    return res.status(500).json({ message:error });
  }
});

// ... other routes

module.exports = sendEmailToList;
