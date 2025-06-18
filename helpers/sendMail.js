/* eslint-disable */
const nodemailer = require("nodemailer");
require("dotenv").config();

const sendMail = (email, mailBody, subject) =>
  new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "researchsummit@carisca.knust.edu.gh",
        pass: "xbkfhxzmdwtallvk",
      },
    });

    // write a function to send the mail

    const mailOptions = {
      from: "CARISCA RESEARCH SUMMIT <researchsummit@carisca.knust.edu.gh>",
      to: email,
      subject: subject || "ACCOUNT PASSWORD",
      html: mailBody,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        reject(error);
      }
      resolve("ok");
      console.log("Email sent successfully");
    });
  });

module.exports = sendMail;
