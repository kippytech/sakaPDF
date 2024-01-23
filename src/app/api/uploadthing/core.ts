import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import {PDFLoader} from "langchain/document_loaders/fs/pdf"
//import { pinecone } from "@/lib/pinecone";
import {OpenAIEmbeddings} from "langchain/embeddings/openai"
import { getPineconeClient } from '@/lib/pinecone'
import {PineconeStore} from "langchain/vectorstores/pinecone"
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { PLANS } from "@/config/stripe";
 
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
    const res = await fetch('https://www.pearsonhighered.com/assets/samplechapter/0/1/3/7/0137080387.pdf')
    const blob = await res.blob()

    //load pdf to memory
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

    //vectorize & index entire pdf
    const pinecone = await getPineconeClient()
    const pineconeIndex = pinecone.Index('sakapdf')
    console.log("pinecone HAPA: >>", pineconeIndex)

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY
    })

    await PineconeStore.fromDocuments(pageLevelContent, embeddings, 
      {
        //@ts-ignore
      pineconeIndex,
      //namespace: createdFile.id
      }
    )

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

 
//const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function
 
// FileRouter for your app, can contain multiple FileRoutes
//export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  //imageUploader: f({ image: { maxFileSize: "4MB" } })
    // Set permissions and file types for this FileRoute
    //.middleware(async ({ req }) => {
      // This code runs on your server before upload
      //const user = await auth(req);
 
      // If you throw, the user will not be able to upload
      //if (!user) throw new Error("Unauthorized");
 
      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      //return { userId: user.id };
    //})
    //.onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      //console.log("Upload complete for userId:", metadata.userId);
 
      //console.log("file url", file.url);
 
      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
//       return { uploadedBy: metadata.userId };
//     }),
// } satisfies FileRouter;
 
// export type OurFileRouter = typeof ourFileRouter;