import dbConnect from "@/lib/dbConn";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";


export async function POST(request: Request) {
    await dbConnect();

    try {
        const { username, email, password } = await request.json()
        const existingUserWithVerfiedByUsername = await UserModel.findOne({
            username,
            isVerified: true,
        })

        if (existingUserWithVerfiedByUsername) {
            return Response.json({
                success: false,
                message: 'Username already exists.'
            },
                {
                    status: 400
                }
            )
        }


        const existingUserWithEmail = await UserModel.findOne({ email })

        const verifyCode = Math.random().toString(36).substring(7);

        if (existingUserWithEmail) {

            if (existingUserWithEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: 'Email already exists.'
                },
                    {
                        status: 400
                    }
                )
            } else {
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUserWithEmail.password = hashedPassword;
                existingUserWithEmail.verifyCode = verifyCode;
                existingUserWithEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
                await existingUserWithEmail.save();
            }
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1)
            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                isVerified: false,
                verifyCode: verifyCode,
                verifyCodeExpiry: expiryDate,
                isAcceptingMessages: true,
                messages: []
            })
            await newUser.save();
        }

        // SEND VERIFICATION EMAIL
        const emailResponse = await sendVerificationEmail(email, username, verifyCode);
        if (emailResponse.success) {
            return Response.json({
                success: true,
                message: 'User registered successfully. Please verify your email address.'
            }, { status: 201 })
        }
        else {
            return Response.json({
                success: false,
                message: 'Error sending verification email. Please try again later.'
            }, { status: 500 })

        }
    }
    catch (error) {

        console.log('Error registering the user ', error);

        return Response.json({
            success: false,
            message: "Error registering the user"
        },
            {
                status: 500
            })
    }
}