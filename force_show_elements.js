console.log('🔧 Force Show Elements Script Running...');

// Function to force show an element
function forceShowElement(elementId, description) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.setProperty('display', 'block', 'important');
        element.style.setProperty('visibility', 'visible', 'important');
        element.style.setProperty('opacity', '1', 'important');
        element.style.setProperty('height', 'auto', 'important');
        element.style.setProperty('max-height', 'none', 'important');
        element.style.setProperty('overflow', 'visible', 'important');
        element.classList.remove('hidden');
        element.classList.add('visible');
        console.log(`✅ Forced show: ${description} (${elementId})`);
        return true;
    } else {
        console.log(`❌ Element not found: ${description} (${elementId})`);
        return false;
    }
}

// Elements to force show
const elementsToShow = [
    { id: 'analysis-results', description: 'Analysis Results Section' },
    { id: 'content-display-section', description: 'Extracted Content Section' },
    { id: 'content-display', description: 'Content Display Textarea' },
    { id: 'additional-notes-section', description: 'Additional Notes Section' },
    { id: 'course-notes', description: 'Additional Notes Textarea' },
    { id: 'course-title-section', description: 'Course Title Section' },
    { id: 'manual-course-title', description: 'Course Title Input' },
    { id: 'course-generation-section', description: 'Course Generation Section' },
    { id: 'generate-course-btn', description: 'Generate Course Button' }
];

// Force show all elements
let successCount = 0;
elementsToShow.forEach(item => {
    if (forceShowElement(item.id, item.description)) {
        successCount++;
    }
});

console.log(`\n📊 Summary: ${successCount}/${elementsToShow.length} elements forced to show`);

// Add some visual feedback
if (successCount > 0) {
    // Add a temporary highlight to show the elements
    elementsToShow.forEach(item => {
        const element = document.getElementById(item.id);
        if (element) {
            element.style.setProperty('border', '2px solid #10b981', 'important');
            element.style.setProperty('background-color', '#f0fdf4', 'important');
            element.style.setProperty('padding', '10px', 'important');
            element.style.setProperty('margin', '5px 0', 'important');
            
            // Remove highlight after 3 seconds
            setTimeout(() => {
                element.style.removeProperty('border');
                element.style.removeProperty('background-color');
                element.style.removeProperty('padding');
                element.style.removeProperty('margin');
            }, 3000);
        }
    });
    
    console.log('🎉 Elements should now be visible! Look for the green borders.');
} else {
    console.log('❌ No elements were found. Check if the analysis has completed.');
}

// Additional debugging info
console.log('\n🔍 Debug Information:');
console.log('Current URL:', window.location.href);
console.log('Analysis section exists:', !!document.getElementById('analysis-section'));
console.log('Analysis results exists:', !!document.getElementById('analysis-results'));

// Check if we're in the right page
if (document.getElementById('course-form')) {
    console.log('✅ Course creation form found');
} else {
    console.log('❌ Course creation form not found - wrong page?');
}

// Check for any hidden elements with CSS
const hiddenElements = document.querySelectorAll('[style*="display: none"], [style*="visibility: hidden"]');
console.log(`Found ${hiddenElements.length} elements with hidden styles`);

// Show the first few hidden elements
hiddenElements.forEach((element, index) => {
    if (index < 5) {
        console.log(`Hidden element ${index + 1}:`, element.id || element.className || element.tagName);
    }
}); 