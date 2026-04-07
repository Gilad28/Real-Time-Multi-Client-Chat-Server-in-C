import { resendClient, sender } from "../lib/resend.js"
import { createWelcomeEmailTemplate } from "../emails/emailTemplate.js";

export const sendWeclomeEmail = async (email,name,clientURL) => {
    const {data, error} = await resendClient.emails.send({
        from:`${sender.name} <${sender.email}>`,
        to: email,
        subject: "Welcome To The MultiChatClient!",
        html: createWelcomeEmailTemplate(name, clientURL)
    });

    if (error){
        console.error("Could not send weclome email: ", error);
        throw new Error("Failed to send welcome email.");
    }

    console.log("Welcome Email Sent Successfully: ", data);
};