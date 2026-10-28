import { ProjectFiles } from '../types';

export function compilePreviewDocument(files: ProjectFiles): string {
  const indexHtml = files['index.html'];

  if (indexHtml && indexHtml.trim().length > 0) {
    // If index.html already has <!DOCTYPE or <html>, return it directly
    if (indexHtml.includes('<html') || indexHtml.includes('<!DOCTYPE') || indexHtml.includes('<!doctype')) {
      return indexHtml;
    }

    // Wrap in standard boiler if partial
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    h1, h2, h3, h4 { font-family: 'Space Grotesk', sans-serif; }
  </style>
</head>
<body>
  ${indexHtml}
</body>
</html>`;
  }

  // Fallback if index.html is missing
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#030407] text-[#F5F7FF] flex items-center justify-center min-h-screen font-sans">
  <div class="text-center p-8 max-w-md">
    <div class="w-3 h-3 rounded-full bg-[#D4FF24] mx-auto mb-4 animate-ping"></div>
    <h2 class="text-xl font-bold mb-2">No index.html file found</h2>
    <p class="text-sm text-gray-400">Add an index.html file to preview your website.</p>
  </div>
</body>
</html>`;
}
