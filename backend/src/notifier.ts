import { INotifyService } from "@baijanstack/express-auth";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: "maddison53@ethereal.email",
    pass: "jn7jnAPss4f63QBp6D",
  },
});
export class EmailNotificationService implements INotifyService {
  async sendTokenStolen(email: string): Promise<void> {
    console.log(`Notifying | TOKEN_STOLEN | Email: ${email}`);
  }
  async sendOtp(
    email: string,
    payload: { code: string; generatedAt: number }
  ): Promise<void> {
    console.log(`Notifying | OTP | Email: ${email}`, payload);
  }
  async notifyEmailVerified(email: string): Promise<void> {
    console.log(`Notifying | EMAIL_VERIFIED | Email: ${email}`);

    const info = await transporter.sendMail({
      from: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>', // sender address
      to: email, // list of receivers
      subject: "Your email has been verified", // Subject line
      text: `Hello user your email ${email} has been verified`, // plain text body
      html: "<b>email verified?</b>", // html body
    });
  }
}
