import dbConnect from "@/lib/dbConn";
import mongoose from "mongoose";
import UserModel from "@/models/User";
import { Message } from "@/models/User";

export async function POST(req: Request) {
    await dbConnect();
    const { username, content } = await req.json();
    try {
        const user = await UserModel.findOne({ username })
        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User Not found",
                },
                { status: 404 }
            );
        }
        if (!user.isAcceptingMessages) {
            return Response.json(
                {
                    success: false,
                    message: "User is not accepting messages",
                },
                { status: 403 }
            );
        }

        const newMessage = { content, createdAt: new Date() }
        user.messages.push(newMessage as Message)
        await user.save()
        return Response.json(
            {
                success: true,
                message: "Message sent",
            },
            { status: 200 }
        );
    } catch (error) {
        return Response.json(
            {
                success: false,
                message: "Failed to send message",
            },
            { status: 500 }
        );

    }
}