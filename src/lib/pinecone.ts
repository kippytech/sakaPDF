
//import { PineconeClient } from '@pinecone-database/pinecone'
import {Pinecone} from '@pinecone-database/pinecone'

export const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
})

// export const getPineconeClient = async () => {
//     const client = new PineconeClient()
  
//     await client.init({
//       apiKey: process.env.PINECONE_API_KEY!,
//       environment: 'us-east1-gcp',
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