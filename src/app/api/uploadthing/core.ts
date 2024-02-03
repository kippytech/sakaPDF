import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import {PDFLoader} from "langchain/document_loaders/fs/pdf"
import { pinecone } from "@/lib/pinecone";
import {OpenAIEmbeddings} from "langchain/embeddings/openai"
//import { getPineconeClient } from '@/lib/pinecone'
import {PineconeStore} from "langchain/vectorstores/pinecone"
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { PLANS } from "@/config/stripe";
import { getEmbedding } from "@/lib/openai";
import {Document, RecursiveCharacterTextSplitter} from '@pinecone-database/doc-splitter'
import { PineconeRecord } from "@pinecone-database/pinecone";
import md5 from "md5"
import { convertToAscii } from "@/lib/utils";
import { prepareDocument, processDocuments } from "@/lib/docProcessingb4embed";
 
const f = createUploadthing();

//middleware for different plans file size
const middleware = async () => {
  const{getUser} = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) throw new Error('Unauthorized')

    const subscriptionPlan = await getUserSubscriptionPlan()

    return { userId: user.id, subscriptionPlan }
}

const onUploadComplete = async ({ metadata, file }: { metadata: Awaited<ReturnType<typeof middleware>>; file: { key: string; name: string; url: string }}) => {

  //check if file exists to avoid the onUpload complete being called twice
  const fileExists = await db.file.findFirst({
    where: {
      key: file.key
    }
  })

  if (fileExists) return

  //now run the function
  const createdFile = await db.file.create({
    data: {
      key: file.key,
      name: file.name,
      userId: metadata.userId,
      url: file.url, //`https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
      uploadStatus: 'PROCESSING'
    }
  })

  try {
    //const res = await fetch(`https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`) 
    const res = await fetch(createdFile.url)  
    //const res = await fetch('https://files.eric.ed.gov/fulltext/EJ1216485.pdf')
    const blob = await res.blob()

    //1. load pdf to memory
    let pageLevelContent: any
    try {
      const loader = new PDFLoader(blob)

      pageLevelContent = await loader.load()

      const pagesAmt = pageLevelContent.length

      //destructure subscription plan
      const {subscriptionPlan} = metadata
      const {isSubscribed} = subscriptionPlan

      const isProExceeded = pagesAmt > PLANS.find((plan) => plan.name === 'Pro')!.pagesPerPdf
      const isFreeExceeded = pagesAmt > PLANS.find((plan) => plan.name === 'Free')!.pagesPerPdf

      if ((isSubscribed && isProExceeded) || (!isSubscribed && isFreeExceeded)) {
        await db.file.update({
          data: {
            uploadStatus: 'FAILED'
          },
          where: {
            id: createdFile.id
          }
        })
      }

    } catch (pdfError) {
        console.error('SHIDA', pdfError)
    }

    //2. split & segment pdf
    const documents = await Promise.all(pageLevelContent.map(prepareDocument))

    //3. vectorize & embed entire pdf(individual documents)
    //const vectors = await  Promise.all(documents.flat().map(embedDocument))
    const vectors = await processDocuments(documents)

    //4. upload to pinecone
    //const pinecone = await getPineconeClient()
    const pdfIndex = pinecone.Index('pdf')
    //console.log("pinecone HAPA: >>", pdfIndex)
    const namespace = pdfIndex.namespace(convertToAscii(createdFile.id))
    await namespace.upsert(vectors)
    console.log('pinecone HAPA: >>>', pdfIndex)

    //return documents[0]

    // const embeddings = new OpenAIEmbeddings({
    //   openAIApiKey: process.env.OPENAI_API_KEY
    // })

    //const embeddings = await getEmbedding(pageLevelContent)

    // await PineconeStore.fromDocuments(pageLevelContent, embeddings, 
    //   {
    //     //@ts-ignore
    //   pineconeIndex,
    //   //namespace: createdFile.id
    //   }
    // )

  //   await pdfIndex.upsert([{
  //      id: createdFile.id,
  //      values: embeddings,
  //      //metadata: {createdFile.}
  // }])

    await db.file.update({
      data: {
        uploadStatus: 'SUCCESS'
      },
      where: {
        id: createdFile.id
      }
    })

  } catch (error) {
    console.error("Error processing file:", error);

    await db.file.update({
      data: {
        uploadStatus: 'FAILED'
      },
      where: {
        id: createdFile.id
      }
    })
  }

}

export const ourFileRouter = {
  freePlanUploader: f({ pdf: { maxFileSize: "4MB" } })
  .middleware( middleware)
  .onUploadComplete(onUploadComplete),
  proPlanUploader: f({ pdf: { maxFileSize: "16MB" } })
  .middleware( middleware)
  .onUploadComplete(onUploadComplete)
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;