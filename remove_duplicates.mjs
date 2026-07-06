import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Find the first occurrence of:
// {/* --- TAB 4: CONTENT LIBRARY --- */}
const contentLibraryIndex = content.indexOf("{/* --- TAB 4: CONTENT LIBRARY --- */}");

// Find the SECOND occurrence of:
// {activeTab === 'visual-studio' && (<ErrorBoundary fallbackTitle="Visual Studio Error">
const vsStartStr = "{activeTab === 'visual-studio' && (<ErrorBoundary fallbackTitle=\"Visual Studio Error\">";
const firstVsIndex = content.indexOf(vsStartStr);
const secondVsIndex = content.indexOf(vsStartStr, firstVsIndex + 1);

if (secondVsIndex !== -1 && contentLibraryIndex !== -1) {
    console.log("Found duplicate block!");
    console.log("Start index:", secondVsIndex);
    console.log("End index:", contentLibraryIndex);
    
    // Check what is right before contentLibraryIndex.
    // It should be `        )}`
    let startDelete = content.lastIndexOf(")}", secondVsIndex) + 2; 
    // actually, we want to delete from secondVsIndex to contentLibraryIndex
    content = content.substring(0, secondVsIndex) + content.substring(contentLibraryIndex);
    
    fs.writeFileSync('src/App.tsx', content, 'utf8');
    console.log("Deleted duplicate blocks safely!");
} else {
    console.log("Could not find boundaries.");
}

