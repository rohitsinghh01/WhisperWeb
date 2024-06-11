import dbConnect from "@/lib/dbConn";
import UserModel from "@/models/User";

export async function POST(request: Request) {
    await dbConnect()
    try {

        const { username, code } = await request.json();
        const decodedUser = decodeURIComponent(username)
        const user = await UserModel.findOne({ username: decodedUser });
        if (!user) {
            return Response.json({
                success: false,
                messsage: 'User Not Found'
            }, { status: 400 })
        }
        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            await user.save();
            return Response.json({
                success: true,
                messsage: 'Account Verified successfully'
            }, { status: 200 })
        }
        else if (!isCodeNotExpired) {
            return Response.json({
                success: false,
                messsage: 'Verification code is expired.Please sign-up again'
            }, { status: 400 })
        }
        else {
            return Response.json({
                success: false,
                messsage: 'Incorrect Verification Code'
            }, { status: 400 })
        }
    } catch (error) {
        console.log('Error verifying user', error);
        return Response.json({
            success: false,
            messsage: 'Error verifying user'
        }, { status: 400 })
    }
}