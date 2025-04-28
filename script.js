function selectMajor(clickedElement) {
    // remove 'selected' from all
    const majors = document.querySelectorAll('.major-word');
    majors.forEach(major => {
        major.classList.remove('selected');
    });

    // add 'selected' to the clicked one
    clickedElement.classList.add('selected');
}
// randomize word cloud styles
document.addEventListener('DOMContentLoaded', () => {
    const majors = document.querySelectorAll('.major-word');
    majors.forEach(word => {
        const randomFontSize = 20 + Math.random() * 20; // 20px to 40px
        const randomTopMargin = Math.random() * 30;     // 0px to 30px
        const randomLeftMargin = Math.random() * 40;    // 0px to 40px
        const randomRotate = (Math.random() - 0.5) * 20; // -10deg to 10deg

        word.style.fontSize = `${randomFontSize}px`;
        word.style.marginTop = `${randomTopMargin}px`;
        word.style.marginLeft = `${randomLeftMargin}px`;
        word.dataset.originalSize = randomFontSize; // save the original random size
        word.style.transform = `rotate(${randomRotate}deg)`;
    });
});

// when click, bold the word and enlarge it
function selectMajor(clickedElement) {
    const majors = document.querySelectorAll('.major-word');
    majors.forEach(major => {
        major.classList.remove('selected');
        major.style.fontSize = `${major.dataset.originalSize}px`; // reset back to original size
    });

    clickedElement.classList.add('selected');
    const enlargedSize = parseFloat(clickedElement.dataset.originalSize) + 10; // make it bigger
    clickedElement.style.fontSize = `${enlargedSize}px`;
}