import nodemailer from 'nodemailer';


export const sendEmail = async ({
        to=[],
        cc=[],
        bcc=[],
        subject="",
        text="",
        attachments=[],
        html=""
    }={})=>{

    
    const transporter = nodemailer.createTransport({
    service:'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});

    
    
    const info = await transporter.sendMail({
        from: `"Social Media 🥰" <${process.env.EMAIL}>`,
        to,
        cc,
        bcc,
        subject,
        text,
        attachments,
        html
    });

    console.log("Message sent:", info.messageId);
   
}