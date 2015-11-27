'use strict';
var nodemailer = require('nodemailer');
var i18n = require("i18n");
var emailTemplates = require('email-templates');

i18n.configure({
    locales:['en','se','it'],
    directory: __dirname + '/locales',
    objectNotation: true,
    // failbacks: {
    //   se: 'en',
    //   it: 'en',
    // }
});

var setLocale = function(user) {
  if( user.profile.language === 'Swedish' ) {
    return i18n.setLocale('se');
  }
  if ( user.profile.language === 'Italian' ) {
    return i18n.setLocale('it');
  }
  return i18n.setLocale('en');
}

var defaultEmailSender = 'YouPower <youpower.app@gmail.com>';

var emailSenderVia = function(sender, via) {
  return sender + ' via ' + (via || defaultEmailSender);
}

exports.invitation_personal = function(user, mail, cb) {
  setLocale(user);

  mail.from = mail.from || emailSenderVia(user.profile.name);
  mail.title = mail.title || i18n.__('INVITATION.PERSONAL_TITLE:Invitation from {{name}} to join YouPower',{name: user.profile.name});
  mail.text1 = mail.text1 || i18n.__('INVITATION.PERSONAL_TEXT1:{{name}} joined YouPower and is inviting you to join as well. YouPower is a free energy social app that is simple and fun to use.', {name:user.profile.name});

  invitation_general(user, mail, cb);

}

var invitation_general = function(user, mail, cb) {

  mail.from = mail.from || defaultEmailSender;
  mail.to = mail.to || (mail.name + '<' + mail.email + '>');
  mail.subject = mail.subject || i18n.__('INVITATION.SUBJECT:Invitation to join YouPower');
  mail.title = mail.title || i18n.__('INVITATION.TITLE:Invitation to join YouPower');
  mail.imageLink =  mail.imageLink || 'https://app.civisproject.eu/images/banner.jpg';
  mail.greetings =  mail.greetings || i18n.__('GREETING:Hi there,')
  mail.text1 = mail.text1 || i18n.__('INVITATION.TEXT1:We invite you to discover YouPower, a free energy social app that is simple and fun to use.');
  mail.buttonText = mail.buttonText ||i18n.__('INVITATION.BUTTON_TEXT:Join Now');
  mail.text2 = mail.text2 || i18n.__('INVITATION.TEXT2:With YouPower you can find answers to your questions about different energy practices and save energy together with your family, friends or neighbors. Sign up to disover more.');
  mail.text3 = mail.text3 || i18n.__('INVITATION.TEXT3:Thanks, have a lovely day!');
  mail.signature = mail.signature || i18n.__('SIGNATURE:YouPower Team');

  sendMailTemplate('invitation', mail, cb);
}

exports.resetPassword = function(user, cb) {
  setLocale(user);

  var mail = {
    from: defaultEmailSender,
    to: user.email,
    subject: i18n.__('PASSWORD_RESET.SUBJECT:Password reset for YouPower'),
    greeting: i18n.__('GREETING:Hi there,'),
    textBefore: i18n.__('PASSWORD_RESET.TEXT_BEFORE:You have requested password reset. To reset your password, click the URL below:'),
    tokenLink: 'https://app.civisproject.eu/frontend.html#/recover/' + user.passwordResetToken,
    textAfter: i18n.__('PASSWORD_RESET.TEXT_AFTER:If you did not request your password to be reset, just ignore this email and your password will continue to stay the same.'),
    signature: i18n.__('SIGNATURE:YouPower team')
  }

  sendMailTemplate('password_reset', mail, cb);
}

var sendMailTemplate = function(templateName, locals, cb) {

  emailTemplates(__dirname + '/templates', function(err, templates){
    templates(templateName,locals,function(err,html,text){
      if (err) {
        return cb(err);
      }

      locals.html = html;
      locals.text = text;

      sendMail(locals,cb);
    })
  })
}

var sendMail = function(mailOptions, cb) {

  var transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
          user: 'youpower.app@gmail.com', // YouPower email id
          pass: 'S+bk@4uQ<A6wk0<u3~.o]q6iA' // YouPower email password
      }
  });

  transporter.sendMail(mailOptions, function(err, info){
    cb(err, mailOptions);
  });
};
