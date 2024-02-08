const  sgMail = require ("@sendgrid/mail")
const { Model } = require("mongoose")
 function sendVerificationEmail(
  { to, subject, text, html},email ,
  success,
  failure
) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  sgMail
    .send({
      from: "etqan.assessment.tool.2023@gmail.com",

      to: email,

      subject: subject,
      text: text,
      html: html,
      mailSettings: {
        sandboxMode: {
          enable: process.env.NODE_ENV == "test"
        }
      }
    })
    .then(success)
    .catch(failure)
}

module.exports = {sendVerificationEmail}