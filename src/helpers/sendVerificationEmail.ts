import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/verificationEmail";
import { apiResponse } from "@/types/Apiresponse";
import { string } from "zod";

export async function sendVerificationEmail(

    email: string,
    username: string,
    verifyCode: string
): Promise<apiResponse> {
    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'WhisperWeb Account Verification',
            react: VerificationEmail({ username, otp: verifyCode }),
        });
        return { success: true, message: 'Verification email sent successfully' }
    } catch (error) {
        console.log('Error in sendVerificationEmail:', error)
        return { success: false, message: 'Failed to send verification email. Please try again later.' }
    }

}