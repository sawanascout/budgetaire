// import { handleUpload } from "@vercel/blob/server"
// import { NextResponse } from "next/server"

// export async function POST(request: Request): Promise<NextResponse> {
//   const { searchParams } = new URL(request.url)
//   const filename = searchParams.get("filename")

//   if (!filename) {
//     return NextResponse.json({ error: "Filename is required" }, { status: 400 })
//   }

//   // Ensure request.body is not null
//   if (!request.body) {
//     return NextResponse.json({ error: "Request body is empty" }, { status: 400 })
//   }

//   try {
//     const jsonResponse = await handleUpload({
//       body: request.body, // Pass the raw request body directly
//       request,
//       onBeforeGenerateToken: async (pathname: string) => {
//         // Generate a client token for the upload.
//         return {
//           allowedContentTypes: ["image/*", "application/pdf"],
//           tokenPayload: JSON.stringify({
//             // optional metadata that will be stored with the blob
//             userId: "123", // Replace with actual user ID if available
//             pathname,
//           }),
//         }
//       },
//       onUploadCompleted: async ({ blob, tokenPayload }) => {
//         // Get notified once the upload has completed.
//         console.log("Blob uploaded:", blob.pathname)
//         try {
//           // Run any logic after the upload is complete
//           const { userId } = JSON.parse(tokenPayload)
//           // For example, update a database with the blob url
//           // This part runs on Vercel's serverless function after upload
//         } catch (error) {
//           console.error("Error processing tokenPayload:", error)
//           throw new Error("Failed to process upload completion.")
//         }
//       },
//     })

//     return NextResponse.json(jsonResponse)
//   } catch (error) {
//     console.error("Error uploading blob:", error)
//     return NextResponse.json(
//       { error: (error as Error).message || "Failed to upload file" },
//       { status: 500 }, // The webhook will retry 5 times
//     )
//   }
// }
