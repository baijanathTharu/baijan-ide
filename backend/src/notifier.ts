import { INotifyService } from "@baijanstack/express-auth";
import nodemailer from "nodemailer";
import { env } from "./config";

// config for transporter(our email server)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: env.USER,
    pass: env.PASS,
  },
});

export class EmailNotificationService implements INotifyService {
  async sendTokenStolen(email: string): Promise<void> {
    console.log(`Notifying | TOKEN_STOLEN | Email: ${email}`);
    const info = await transporter.sendMail({
      from: "<maddison53@ethereal.email>", // sender address
      to: email, // list of receivers
      subject: "Attention: Your token has been stolen", // Subject line
      text: `Hello user, Your token has been stolen. This email is to notify you of that`, // plain text body
      html: "<b>email verified?</b>", // html body
    });
    console.log("info is", info);
  }
  async sendOtp(
    email: string,
    payload: { code: string; generatedAt: number }
  ): Promise<void> {
    console.log(`Notifying | OTP | Email: ${email}`, payload);

    const info = await transporter.sendMail({
      from: "<maddison53@ethereal.email>", // sender address
      to: email, // list of receivers
      subject: "Attention: Your otp code is here", // Subject line
      text: ``, // plain text body
      html: `<b>Hello user, your otp code generate at ${payload.generatedAt} is here, please do not share it with anybody 
    </b> <strong>${payload.code}`, // html body
    });
    console.log("info is", info);
  }
  async notifyEmailVerified(email: string): Promise<void> {
    console.log(`Notifying | EMAIL_VERIFIED | Email: ${email}`);

    const info = await transporter.sendMail({
      from: "<maddison53@ethereal.email>", // sender address
      to: email, // list of receivers
      subject: "Your email has been verified", // Subject line
      text: `Hello user your email ${email} has been verified`, // plain text body
      html: "<b>email verified?</b>", // html body
    });
    console.log("info is", info);
  }
}
