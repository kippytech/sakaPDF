import OpenAI from "openai";

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export async function getEmbedding(text: string) {
    try {
        const res = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: text  //replace(/\n/g, ' ')
        })

        const embedding =  res.data[0].embedding

        console.log(embedding)

        return embedding
    } catch (error) {
        console.log('error generating embeddings', error)
        throw error
    }
}