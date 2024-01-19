import { db } from "@/db";
import { sendMessageValidator } from "@/lib/validators/sendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST (req: NextRequest) {
    //endpoint for asking quiz  to pdf
    const body = await req.json()

    const {getUser} = getKindeServerSession()
    const user = await getUser()

    const {id: userId} = user!

    if (!userId) return NextResponse.json({'Unauthorized': {status: 401}})

    const {fileId, message} = sendMessageValidator.parse(body)

    const file = await db.file.findFirst({
        where: {
            id: fileId,
            userId
        }
    })

    if (!file) return NextResponse.json({'Not Found': {status: 404}})

    await db.message.create({
        data: {
            text: message,
            isUserMessage: true,
            userId,
            fileId
        }
    })
}