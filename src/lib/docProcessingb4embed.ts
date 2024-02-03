import { getEmbedding } from "@/lib/openai";
import {Document, RecursiveCharacterTextSplitter} from '@pinecone-database/doc-splitter'
import { PineconeRecord } from "@pinecone-database/pinecone";
import md5 from "md5"

  export async  function embedDocument(doc: Document) {
    try {
      const embeddings = await getEmbedding(doc.pageContent)
      const hash = md5(doc.pageContent)
  
      return {
        id: hash,
        values: embeddings,
        metadata: {
          text: doc.metadata.text,
          pageNumber: doc.metadata.page
        }
      } as PineconeRecord
    } catch (error) {
      console.log('error embedding the doc', error)
      throw error
    }
  }
  
  export const truncateStringByBytes = (str: string, bytes: number) => {
    const enc = new TextEncoder()
    return new TextDecoder('utf-8').decode(enc.encode(str).slice(0, bytes))
  }
  
  type PDFPage = {
    pageContent: string;
    metadata: {
      loc: {pageNumber: number}
    }
  }
  
  export async function prepareDocument(page: PDFPage) {
    let {pageContent, metadata} = page
    pageContent = pageContent.replace(/\n/, '')
  
    //split the docs
    const splitter = new RecursiveCharacterTextSplitter()
    
    const docs = await splitter.splitDocuments([
      new Document({
        pageContent,
        metadata: {
          pageNumber: metadata.loc.pageNumber,
          text: truncateStringByBytes(pageContent, 36000)
        }
      })
    ])
  
    return docs
  }
  
  export async function processDocuments(documents: Document[]) {
    const vectors = [];
    for (const document of documents.flat()) {
        try {
            // Process each document and get its vector
            const vector = await embedDocument(document);
            vectors.push(vector);
        } catch (error: any) {
            console.error('Error processing document:', error)
            // Check if the error is due to rate limiting
            if (error.code === 'rate_limit_exceeded') {
              console.log('Rate limit exceeded. Retrying after 30 seconds...');
              // Retry after a longer delay
              await delay(30000); // 30 seconds delay
              // Retry processing the current document
              continue;
          } else {
              // For other types of errors, rethrow the error
              throw error;
          }
      }
        
    }
    return vectors;
  }
  
  function delay(ms: any) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }