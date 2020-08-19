const nodemailer = require('nodemailer');
const nodemailerSendgrid = require('nodemailer-sendgrid');
const mustache = require('mustache');

let config = global.gConfig; 
let utilFunctions =  {
  
    sendMail : function(from,to,subject,html) {
//        var transporter = nodemailer.createTransport(config.transport);
        
        try {

            console.log(['SENDGRID',config.sendGridApiKey])
            const transporter = nodemailer.createTransport(
                nodemailerSendgrid({
                    apiKey: config.sendGridApiKey
                })
            );
            
        //var transporter = nodemailer.createTransport(config.transport);

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
        } catch (e) {
            console.log(e)
        }
   }
   , 
   sendWelcomeEmail: function(token,name,username) {
		var link = config.authServer + '/doconfirm?code='+token;
		var mailTemplate = config.signupEmailTemplate && config.signupEmailTemplate.length > 0  ? config.signupEmailTemplate : `<div>Hi {{name}}! <br/>

				Welcome,<br/>

				To confirm your registration, please click the link below.<br/>

				<a href="{{link}}" >Confirm registration</a><br/>

				If you did not recently register, please ignore this email.<br/><br/>

				</div>`
		sendMail(config.mailFrom,username,'Confirm your registration',
			mustache.render(mailTemplate,{link:link,name:name}
			)
		);
		item={}
		item.message = 'Check your email to confirm your sign up.';
		return item;
		
	}

}

module.exports = utilFunctions;
