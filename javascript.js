const objectiveText = "System.out.println('Building Scalable Cloud Infrastructure...');";
let index = 0;

function typeWriter() {
    const target = document.getElementById("typewriter");
    if (target && index < objectiveText.length) {
        target.innerHTML += objectiveText.charAt(index);
        index++;
        setTimeout(typeWriter, 50);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    typeWriter();
    
    // Contact Form Logic
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            alert("Execution Success: Message received by Cloud Infrastructure.");
            form.reset();
        });
    }
});
