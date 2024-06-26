import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { User as UserNextAuth } from "next-auth";
import dbConnect from "@/lib/dbConn";
import mongoose from "mongoose";
import UserModel from "@/models/User";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    const user: UserNextAuth = session?.user as UserNextAuth;


    if (!session || !user) {
        return Response.json(
            {
                success: false,
                message: "not authenticated",
            },
            { status: 401 }
        );
    }


    const userId = new mongoose.Types.ObjectId(user._id);
    try {
        const user = await UserModel.aggregate([
            { $match: { id: userId } },
            { $unwind: '$messages' },
            { $sort: { 'messages.createdAt': -1 } },
            { $group: { _id: '$_id', messages: { $push: '$messages' } } },
        ])
        if (!user || user.length == 0) {
            return Response.json(
                {
                    success: false,
                    message: "User Not found",
                },
                { status: 401 }
            );
        }
        return Response.json(
            {
                success: true,
                messages: user[0].messages,
            },
            { status: 200 }
        );

    } catch (error) {
        console.log("failed to get messages", error);
        return Response.json(
            {
                success: false,
                message: "Failed to get messages",
            },
            { status: 500 }
        );
    }
}