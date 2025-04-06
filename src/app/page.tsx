'use client'; // Required for App Router if using hooks

import React, { useState, useRef, ChangeEvent, FormEvent } from 'react';
import Head from 'next/head'; // Use next/head for Pages Router
// import { Metadata } from 'next'; // Use Metadata export for App Router SEO

// Optional: Loading Spinner
import { PulseLoader } from 'react-spinners';

// Define the structure of the results we expect from the API
interface InteractionData {
    medication: string;
    avoid: string[];
    recommend: string[];
}

// For App Router SEO (replace Head component usage)
// export const metadata: Metadata = {
//   title: 'MediPlate - Medication Food Interactions',
//   description: 'Upload a photo or file of your medication to get dietary recommendations.',
// };


export default function HomePage() {
    const [inputFile, setInputFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null); // Use for image preview
    const [isImageFile, setIsImageFile] = useState<boolean>(true); // Track if it's an image
    const [results, setResults] = useState<InteractionData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Ref for the hidden file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle file selection from file input
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setInputFile(file);
            setError(null); // Clear previous errors
            setResults(null); // Clear previous results

            // Check if the file is an image for preview purposes
            const isImage = file.type.startsWith('image/');
            setIsImageFile(isImage);

            if (isImage) {
                // Create image preview only for image files
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFilePreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                // For non-image files, clear or set a placeholder preview
                setFilePreview(null); // Or maybe show file icon/name?
            }

        } else {
             setInputFile(null);
             setFilePreview(null);
             setIsImageFile(true); // Reset assumption
        }
         // Reset file input value so selecting the same file again triggers onChange
         if (event.target) {
            event.target.value = '';
        }
    };

    // Trigger hidden file input click
    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // Handle form submission to analyze the file
    const handleAnalyze = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent default form submission
        if (!inputFile) {
            setError('Please select a file first (image, HTML, etc.).');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResults(null);

        const formData = new FormData();
        // Backend needs to know what kind of file it might be getting
        formData.append('medicationFile', inputFile); // Use a more generic key name
        formData.append('fileType', inputFile.type); // Send the MIME type

        try {
            // NOTE: The backend /api/analyze MUST be updated to handle
            // different file types based on 'fileType' or by inspecting the file.
            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                // Try to provide a more specific error from backend if available
                throw new Error(data.error || `Analysis failed. Status: ${response.status}. Ensure the file format is supported by the backend.`);
            }

            if (data.data) {
                setResults(data.data);
            } else {
                 // This case might mean the backend processed it but found nothing,
                 // or it's an error case not properly formatted.
                 throw new Error(data.error || 'Analysis completed, but no interaction data was found or returned.');
            }

        } catch (err: any) {
            console.error("Analysis error:", err);
            setError(err.message || 'An unexpected error occurred during analysis.');
            setResults(null); // Ensure results are cleared on error
        } finally {
            setIsLoading(false);
        }
    };

    // Reset state
    const handleReset = () => {
        setInputFile(null);
        setFilePreview(null);
        setResults(null);
        setError(null);
        setIsLoading(false);
        setIsImageFile(true); // Reset assumption
         if (fileInputRef.current) {
             fileInputRef.current.value = '';
         }
    };

    // --- Disclaimer Component (same as before) ---
    const Disclaimer = () => (
         <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 my-4 rounded" role="alert">
             <p className="font-bold">Important Disclaimer</p>
             <p>This tool provides general information based on common interactions and file interpretation (OCR for images). It is NOT a substitute for professional medical advice. Always consult your doctor or pharmacist regarding your specific medications, health conditions, and dietary needs. File interpretation accuracy is not guaranteed. Verify medication names.</p>
         </div>
     );

    // --- Results Display Component (same as before) ---
    const ResultsDisplay = ({ data }: { data: InteractionData }) => (
        <div className="mt-6 p-6 border border-gray-300 rounded-lg shadow-md bg-white w-full max-w-2xl"> {/* Increased max-width slightly */}
            <h2 className="text-2xl font-semibold mb-4 text-center text-blue-700">Analysis Results</h2>
            <p className="text-lg mb-4 text-center">
                 Identified Medication (Best Guess): <strong className="font-bold">{data.medication}</strong>
            </p>

             {/* Foods to Avoid Section */}
            {data.avoid && data.avoid.length > 0 && (
                <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded">
                    {/* ... (content same as before) ... */}
                     <h3 className="text-xl font-semibold mb-2 text-red-700 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        Foods/Drinks to Avoid or Limit:
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-red-800">
                        {data.avoid.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
            )}

            {/* Recommended Items Section */}
            {data.recommend && data.recommend.length > 0 && (
                <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded">
                     {/* ... (content same as before) ... */}
                      <h3 className="text-xl font-semibold mb-2 text-green-700 flex items-center">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                             <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                         </svg>
                        Recommendations / Safe Items:
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-green-800">
                        {data.recommend.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
            )}
             <Disclaimer />
             <div className="text-center mt-6">
                <button
                    onClick={handleReset}
                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg shadow transition duration-200 ease-in-out"
                >
                    Analyze Another File
                </button>
             </div>
        </div>
    );

    return (
        <>
            {/* Use Head for Pages Router */}
             <Head>
                 <title>MediPlate - Medication Food Interactions</title>
                 <meta name="description" content="Upload a photo or file (HTML, JPEG, PNG) of your medication to get dietary recommendations." />
                 <link rel="icon" href="/favicon.ico" />
             </Head>

            <main className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-blue-50 to-white">
                <h1 className="text-4xl font-bold text-center mb-2 text-blue-800">
                    Medi<span className="text-green-600">Plate</span>
                </h1>
                <p className="text-center text-gray-600 mb-6">
                    Check medication food interactions from a photo or file.
                </p>

                <Disclaimer />

                {!results && (
                    <form onSubmit={handleAnalyze} className="w-full max-w-lg flex flex-col items-center bg-white p-8 rounded-lg shadow-xl border border-gray-200">
                        {/* Hidden File Input - Updated Accept Attribute */}
                        <input
                            type="file"
                             // Allow common image types and HTML explicitly
                            accept="image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp,text/html,.html"
                            // You could remove 'accept' entirely to allow ANY file,
                            // but explicitly listing helps guide the user.
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            className="hidden"
                            disabled={isLoading}
                        />

                        {/* File Preview Area - Conditional Rendering */}
                        <div className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4 bg-gray-50 overflow-hidden">
                            {isImageFile && filePreview ? (
                                // Show image preview if it's an image and preview exists
                                <img src={filePreview} alt="Medication Preview" className="max-h-full max-w-full object-contain" />
                            ) : inputFile ? (
                                // Show file info if it's not an image but a file is selected
                                <div className="text-center text-gray-600 p-4">
                                    <p className="font-semibold">File Selected:</p>
                                    <p className="text-sm truncate w-60">{inputFile.name}</p>
                                    <p className="text-xs mt-1">({inputFile.type})</p>
                                    <p className="text-xs mt-2">(Preview not available for this file type)</p>
                                </div>
                            ) : (
                                // Placeholder text if nothing is selected
                                <span className="text-gray-500">File Preview Area</span>
                            )}
                        </div>

                         {/* Error Message Display */}
                        {error && !isLoading && (
                            <p className="text-red-600 text-center mb-4 font-semibold">{error}</p>
                        )}

                        {/* User Guidance Text */}
                         <p className="text-sm text-gray-500 mb-4 text-center">
                              Please upload an image (JPEG, PNG, etc.) or HTML file containing medication information.
                         </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-center gap-4 w-full">
                             <button
                                type="button"
                                onClick={triggerFileInput}
                                disabled={isLoading}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex-grow"
                            >
                                {inputFile ? 'Change File' : 'Select File'}
                            </button>

                            {inputFile && (
                                <button
                                    type="submit"
                                    disabled={isLoading || !inputFile}
                                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex-grow"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                           <PulseLoader size={8} color="#ffffff" className="mr-2"/> Analyzing...
                                        </div>
                                        ) : (
                                            'Analyze Medication'
                                        )}
                                </button>
                            )}
                        </div>
                         {isLoading && <p className="mt-4 text-blue-600">Processing file, please wait...</p>}
                    </form>
                 )}


                 {/* Display Results */}
                 {results && !isLoading && <ResultsDisplay data={results} />}

                 {/* Display Error specific to results loading */}
                 {error && !isLoading && !results && (
                     <div className="mt-6 text-center w-full max-w-lg">
                          <p className="text-red-600 font-semibold bg-red-100 p-4 rounded border border-red-300">{error}</p>
                           <button
                                onClick={handleReset}
                                className="mt-4 px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg shadow transition duration-200 ease-in-out"
                            >
                                Try Again
                            </button>
                     </div>
                 )}
            </main>
        </>
    );
}
