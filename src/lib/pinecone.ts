
//import { PineconeClient } from '@pinecone-database/pinecone'
import {Pinecone} from '@pinecone-database/pinecone'

export const pinecone = new Pinecone({
  environment: 'gcp-starter',
    apiKey: process.env.PINECONE_API_KEY!,
})

// export const getPineconeClient = async () => {
//     const client = new PineconeClient()
  
//     await client.init({
//       apiKey: process.env.PINECONE_API_KEY!,
//       environment: 'gcp-starter',
//     })
  
//     return client
//   }

// await pinecone.createIndex({
//     name: 'sakapdf',
//     dimension: 1536,
//     metric: 'cosine',
//     spec: {
//         pod: {
//             environment: 'gcp-starter',
//             podType: 'starter'
//         }
//     }
// })