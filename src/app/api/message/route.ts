import { db } from "@/db";
import { getContext } from "@/lib/context";
import { openai } from "@/lib/openai";
import { pinecone } from "@/lib/pinecone";
import { sendMessageValidator } from "@/lib/validators/sendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { PineconeStore } from "@langchain/community/vectorstores/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { OpenAIStream, StreamingTextResponse } from 'ai'
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

    //vectorize message
    // const embeddings = new OpenAIEmbeddings({
    //     openAIApiKey: process.env.OPENAI_API_KEY
    // })

    //const pineconeIndex = pinecone.index('sakapdf')
    const results = await getContext(message, fileId)

    //search vector store for the most relevant part
    // const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    //     pineconeIndex,
    //     //namespace: file.id
    // })

    // const results = await vectorStore.similaritySearch(message, 4)
    //would have used results here below
    //${results.map((r) => r.pageContent).join('\n\n')}

    const prevMessages = await db.message.findMany({
        where: {
            fileId: fileId
        },
        orderBy: {
            createdAt: 'asc'
        },
        take: 6 
    })

    //send to openai for answer
    const formattedPrevMessages = prevMessages.map((msg) => ({
        role: msg.isUserMessage ? 'user' as const : 'assistant' as const,
        content: msg.text
    }))

    const res = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        temperature: 0,
        stream: true,
        messages: [
            {
              role: 'system',
              content:
                'Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. The AI assistant is knowledgeable and clever. When asked a question such as this document or this pdf the AI is able to decipher that the user is implying the context provided and the AI should not respond with answers that suggest it does not have the context since the context shall have been provided by the time the user interacts with the AI. So basically any question is referring to the provided context. However, the AI should not make up answers if it does not know or have enough context',
            },
            {
              role: 'user',
              content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
              
        \n----------------\n
        
        PREVIOUS CONVERSATION:
        ${formattedPrevMessages.map((message) => {
          if (message.role === 'user')
            return `User: ${message.content}\n`
          return `Assistant: ${message.content}\n`
        })}
        
        \n----------------\n
        
        CONTEXT:
        
        ${results}
        
        USER INPUT: ${message}`,
            },
          ]
    })

    //main reason for not using trpc in this route
    //use vercel ai sdk
    const stream = OpenAIStream(res, {
        async onCompletion(completion) {
            await db.message.create({
                data: {
                    text: completion,
                    isUserMessage: false,
                    fileId,
                    userId
                }
            })
        }
    })

    return new StreamingTextResponse(stream)
}