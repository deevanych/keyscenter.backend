import nodemailer from 'nodemailer'
import {emailTemplate} from '../../../../data/emailTemplate'

export default {
  async afterUpdate(event) {
    const {result} = event

    if (result.is_paid) {
      console.log('Order has been paid!')
      const emailTo = result.users_permissions_user.email
      const testAccount = await nodemailer.createTestAccount();

      let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });

      let info = await transporter.sendMail({
        from: "order@keyscenter.ru",
        to: emailTo,
        subject: "Hello ✔",
        text: "Hello world?",
        html: emailTemplate
      });

      console.log("Message sent: %s", info.messageId);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
  },
};
