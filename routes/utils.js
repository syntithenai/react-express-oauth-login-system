const nodemailer = require('nodemailer');
const config=require('../config');
   
let utilFunctions =  {
  
  sendMail : function(from,to,subject,html) {
        var transporter = nodemailer.createTransport(config.transport);

        var mailOptions = {
          from: from,
          to: to,
          subject: subject,
          html: html
        };
        console.log(mailOptions);
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
            //res.send('FAIL');
          } else {
            console.log('Email sent: ' + info.response);
            //res.send('OK');
          }
        });
   }

}

module.exports = utilFunctions;
