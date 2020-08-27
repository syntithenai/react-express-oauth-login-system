require('dotenv').config()

// map environment variables into configuration for login system
module.exports = {
   sessionSalt: process.env.sessionSalt ? process.env.sessionSalt : 'this is a new session salt value',
   // md5 hash passwords before storing in database
   encryptedPasswords: process.env.encryptedPasswords && process.env.encryptedPasswords.toUpperCase() === "TRUE" ? true : false ,
   csrfCheck: process.env.csrfCheck && process.env.csrfCheck.toUpperCase() === "TRUE" ? true : false ,
   requireSSL: process.env.requireSSL && process.env.requireSSL.toUpperCase() === "TRUE" ? true : false ,
   // server routes only
   userFields:process.env.userFields ? process.env.userFields : ['name','username','avatar'],
   
   // jwt
    jwtIssuer: process.env.jwtIssuer ,
    jwtAccessTokenSecret: process.env.jwtAccessTokenSecret ,
    jwtRefreshTokenSecret: process.env.jwtRefreshTokenSecret,
    jwtAccessTokenExpirySeconds: process.env.jwtAccessTokenExpirySeconds,
    jwtRefreshTokenExpirySeconds: process.env.jwtRefreshTokenExpirySeconds,

   
   // ensure that your mongo database has a user with read/write access defined in the database that you want to use. DO NOT USE ROOT DB CREDENTIALS
   database: process.env.database,
   databaseConnection: process.env.databaseConnection,
   
   authServer: process.env.authServer,
   // when starting server
   authServerPort: process.env.authServerPort,
   // oauth login callback
   loginSuccessRedirect: process.env.loginSuccessRedirect,
   loginFailRedirect: process.env.loginFailRedirect,
   
   // LOGIN CLIENT KEYS AND SECRETS
   googleClientId: process.env.googleClientId,
   googleClientSecret: process.env.googleClientSecret,
   twitterConsumerKey:process.env.twitterConsumerKey,
   twitterConsumerSecret:process.env.twitterConsumerSecret,
   facebookAppId: process.env.facebookAppId,
   facebookAppSecret: process.env.facebookAppSecret,
   githubClientId: process.env.githubClientId,
   githubClientSecret: process.env.githubClientSecret,
   amazonClientId: process.env.amazonClientId,
   amazonClientSecret: process.env.amazonClientSecret,

   
   // local oauth server
   // todo allow for many clients - alexa, google, local... FORNOW create extra records
   clientId:process.env.clientId,
   clientSecret:process.env.clientSecret,
   clientName:process.env.clientName,
   clientWebsite:process.env.clientWebsite,
   clientPrivacyPage:process.env.clientPrivacyPage,
   clientImage:process.env.clientImage,
   
   // EMAIL
   // array of email addresses allowed to register. Empty array means anyone can register.
   // DISABLED allowedUsers:[],  
    // email transport
    // google will complain first time and you will need to enable insecure apps on the email account :(
    // check the src for alternate email configurations (based on [nodemailer](https://nodemailer.com/)
    mailFrom:process.env.mailFrom,
    sendGridApiKey: process.env.sendGridApiKey,
    mailRegisterTopic: 'Confirm your registration',
    mailForgotPasswordSubject: "Update your password ",
    //recoveryEmailTemplate: '',
    //recoveryEmailTemplateText: '',
    //signupEmailTemplate: '',
    //signupEmailTemplateText: '',
    //transport :{
      //service: 'gmail',
      //auth: {
        //user: 'hhh@gmail.com',
        //pass: 'ddd'
      //}
    //}
}

