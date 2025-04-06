// app/api/analyze/route.ts
import { NextResponse, NextRequest } from 'next/server'; // Use NextRequest/NextResponse
import formidable, { File } from 'formidable';
import fs from 'fs';
import path from 'path';
import { createWorker } from 'tesseract.js';
import * as cheerio from 'cheerio';

// --- Dummy Data & Helper Functions (remain the same) ---
interface InteractionData { /* ... */ }
const dummyInteractionDatabase: Record<string, InteractionData> = { /* ... */ };
const knownMedicationKeywords = Object.keys(dummyInteractionDatabase);
const findMedicationInText = (text: string): string | null => { /* ... */ };
// --- End Dummy Data & Helpers ---

// Helper to parse form data in App Router
async function parseFormData(request: NextRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
    const formData = await request.formData();
    const form = formidable({
        maxFileSize: 10 * 1024 * 1024,
        keepExtensions: true,
         // Note: formidable might need write access if you uncomment uploadDir
         // For serverless functions, writing to disk is often ephemeral or restricted.
         // It's usually better to process directly from the buffer or temp path.
         // uploadDir: path.join(process.cwd(), '/tmp'), // Example using /tmp
    });

    // Adapt formidable to work with FormData
    // This is a common pattern, might need adjustments based on formidable version
     return new Promise((resolve, reject) => {
        // Manually pipe entries from FormData to formidable
        // Note: This simplified approach might need refinement for complex cases
         const fields: formidable.Fields = {};
         const files: formidable.Files = {};
         let fileWriteStream: fs.WriteStream | null = null;

         formData.forEach((value, key) => {
             if (value instanceof File) {
                 // Basic handling: save file temporarily to let formidable pick it up
                 // This is less efficient than direct stream piping if formidable supported it easily here
                  const tempFilePath = path.join('/tmp', value.name); // Use /tmp or os.tmpdir()
                  // VERY IMPORTANT: In a real serverless env, ensure /tmp is writable
                  // and clean up these files reliably. Formidable's built-in handling
                  // when parsing req directly is usually better in Pages Router.

                 // Convert Blob/File stream to buffer to write
                 value.arrayBuffer().then(buffer => {
                     fs.writeFile(tempFilePath, Buffer.from(buffer), (err) => {
                         if (err) return reject(err);

                         // Create a formidable-like File object
                          const formidableFile: formidable.File = {
                            size: value.size,
                            filepath: tempFilePath,
                            originalFilename: value.name,
                            mimetype: value.type,
                            lastModifiedDate: new Date(value.lastModified),
                            // You might need to add other properties if your logic uses them
                            hashAlgorithm: false, // Adjust as needed
                            newFilename: value.name, // Adjust as needed
                         };

                         // Formidable expects files potentially in arrays
                         if (files[key]) {
                             if (Array.isArray(files[key])) {
                                 (files[key] as formidable.File[]).push(formidableFile);
                             } else {
                                 files[key] = [files[key] as formidable.File, formidableFile];
                             }
                         } else {
                             files[key] = formidableFile;
                         }

                         // Check if all entries processed (simplistic check)
                         // A more robust solution would track async operations
                         if (Object.keys(fields).length + Object.keys(files).length === Array.from(formData.keys()).length) {
                              resolve({ fields, files });
                         }

                     });
                 }).catch(reject);


             } else {
                 // Handle simple fields
                 if (fields[key]) {
                     if (Array.isArray(fields[key])) {
                         (fields[key] as string[]).push(value);
                     } else {
                         fields[key] = [fields[key] as string, value];
                     }
                 } else {
                    fields[key] = value;
                 }
                  // Check if all entries processed (simplistic check)
                 if (Object.keys(fields).length + Object.keys(files).length === Array.from(formData.keys()).length) {
                      resolve({ fields, files });
                 }
             }
         });
          // Handle case where FormData might be empty
         if (Array.from(formData.keys()).length === 0) {
             resolve({ fields, files });
         }

     });
}


export async function POST(request: NextRequest) {
    // Check Method (Implicitly POST by function name, but good practice)
    if (request.method !== 'POST') {
        // --- FIX: Use NextResponse for response ---
        return new NextResponse(
            JSON.stringify({ error: `Method ${request.method} Not Allowed` }),
            {
                status: 405,
                headers: {
                    // --- FIX: Set headers here ---
                    'Allow': 'POST',
                    'Content-Type': 'application/json',
                },
            }
        );
    }

    let tempFilePath: string | null = null; // Track temp file path for cleanup

    try {
         // Parse the incoming form data
         // Note: The parseFormData helper above is a basic adaptation.
         // Consider libraries specifically designed for FormData parsing in modern edge/node environments if issues arise.
        const { fields, files } = await parseFormData(request);

        const uploadedFile = Array.isArray(files.medicationFile)
            ? files.medicationFile[0]
            : files.medicationFile;

        if (!uploadedFile) {
            return NextResponse.json({ error: 'No file uploaded. Please include a file named "medicationFile".' }, { status: 400 });
        }

        const filePath = uploadedFile.filepath;
        tempFilePath = filePath; // Store for finally block cleanup
        const mimeType = uploadedFile.mimetype;
        console.log(`Received file: ${uploadedFile.originalFilename}, Type: ${mimeType}, Path: ${filePath}`);


        let extractedText: string | null = null;
        // --- Processing Logic (largely the same, using filePath) ---
        if (mimeType?.startsWith('image/')) {
            console.log("Processing as Image...");
            const worker = await createWorker('eng');
            try {
                 const { data: { text } } = await worker.recognize(filePath);
                 extractedText = text;
                 console.log("OCR Result:", text.substring(0, 200) + "...");
            } finally {
                 await worker.terminate();
                 console.log("Tesseract worker terminated.");
            }
        } else if (mimeType === 'text/html') {
            console.log("Processing as HTML...");
            const htmlContent = await fs.promises.readFile(filePath, 'utf8');
            const $ = cheerio.load(htmlContent);
            extractedText = $('body').text();
            if (extractedText) {
                extractedText = extractedText.replace(/\s\s+/g, ' ').trim();
            }
            console.log("HTML Text Content:", extractedText.substring(0, 200) + "...");
        } else {
             console.log(`Unsupported file type: ${mimeType}`);
             return NextResponse.json(
                 { error: `Unsupported file type: ${mimeType}. Please upload an image (JPEG, PNG) or HTML file.` },
                 { status: 415 } // Unsupported Media Type
             );
        }

        // --- Medication Identification & Response ---
        if (extractedText) {
            const medicationKeyword = findMedicationInText(extractedText);
            if (medicationKeyword) {
                const interactionData = dummyInteractionDatabase[medicationKeyword];
                if (interactionData) {
                    console.log(`Found interactions for: ${medicationKeyword}`);
                    // --- FIX: Return NextResponse ---
                    return NextResponse.json({ data: interactionData });
                } else {
                    console.error(`Keyword ${medicationKeyword} found but no data in database!`);
                     // --- FIX: Return NextResponse ---
                     return NextResponse.json(
                        { error: `Identified medication "${medicationKeyword}" but could not find interaction data.` },
                        { status: 404 }
                    );
                }
            } else {
                 console.log("Could not identify a known medication in the extracted text.");
                 // --- FIX: Return NextResponse ---
                 return NextResponse.json(
                     { error: 'Could not identify a known medication in the provided file.' },
                     { status: 404 }
                 );
            }
        } else {
            console.log("No text could be extracted from the file.");
             // --- FIX: Return NextResponse ---
             return NextResponse.json(
                 { error: 'No text content could be extracted from the file.' },
                 { status: 400 }
             );
        }

    } catch (error: any) {
        console.error('Error during file processing:', error);
         // --- FIX: Return NextResponse ---
         return NextResponse.json(
            { error: 'Failed to process the file.', details: error.message },
            { status: 500 }
        );
    } finally {
         // --- Cleanup ---
         if (tempFilePath) {
             console.log(`Attempting to delete temporary file: ${tempFilePath}`);
             await fs.promises.unlink(tempFilePath).catch(e => console.error("Error deleting temporary file:", e));
         }
    }
}

// Optional: Add handlers for other methods like GET if needed
// export async function GET(request: NextRequest) { ... }
