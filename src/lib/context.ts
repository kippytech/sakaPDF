import { getEmbedding } from "./openai"
import { pinecone } from "./pinecone"
import { convertToAscii } from "./utils"

export async function getMatchesFromEmbeddings(embeddings: number[], fileId?: string) {
    try {
        const pdfIndex = pinecone.index('pdf')
        const namespace = pdfIndex.namespace(convertToAscii(fileId!))
        const queryResult = await namespace.query({
            topK: 5,
            vector: embeddings,
            includeMetadata: true
        })
        return queryResult.matches || []
    } catch (error) {
        console.log('error querying embeddings', error)
        throw error
    }
}

export async function getContext(query: string, fileId?: string) {
  const queryEmbeddings = await getEmbedding(query)
  const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileId)

  const qualifyingDocs = matches.filter((match) => match.score && match.score > 0.7)

  type Metadata = {
    text: string,
    pageNumber: number
  }

  let docs = qualifyingDocs.map((match) => (match.metadata as Metadata).text)

  //5 vectors
  return docs.join('\n').substring(0, 3000)
}