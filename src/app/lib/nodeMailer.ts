import nodemailer from "nodemailer";
import config from "../config";


export const transporter = nodemailer.createTransport({
  service: "gmail", // Shortcut for Gmail's SMTP settings - see Well-Known Services
  auth: {
    // type: "OAuth2",
    user: config.smtp_user,
    pass: config.smtp_password,
    
  },
});

