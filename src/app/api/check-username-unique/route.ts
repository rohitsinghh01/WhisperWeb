import dbConnect from "@/lib/dbConn";
import UserModel from "@/models/User";
import { z } from 'zod'
import { usernameValidation } from '@/Schemas/signUpSchema'


const UsernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {

    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const queryParams = {
            username: searchParams.get('username')
        }
        const result = UsernameQuerySchema.safeParse(queryParams);
        // console.log(result)

        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || []
            return Response.json({
                success: false,
                messsage: usernameErrors?.length > 0 ? usernameErrors.join(' ') : 'Invalid Query Parameter'
            }, { status: 400 })
        }

        const { username } = result.data;
        const existingVerifiedUser = await UserModel.findOne({ username, isVerified: true })

        if (existingVerifiedUser) {
            return Response.json({
                success: false,
                messsage: 'Username is already taken'
            }, { status: 400 })
        }

        return Response.json({
            success: true,
            messsage: 'Username is unique'
        }, { status: 200 })

    } catch (error) {
        console.error('Error Checking the username', error);
        return Response.json({
            success: false,
            message: "Error checking the username"
        }, {
            status: 500,
        })
    }
}