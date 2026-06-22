// Force scroll to top on page reload
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// Remove hash from URL to prevent jumping to sections on reload
if (window.location.hash) {
    history.replaceState(null, null, window.location.pathname + window.location.search);
}

const images = document.querySelectorAll('.slider-img');
const controlls = document.querySelectorAll('.controlls');
let imageIndex = 0;

function show(index) {
    images[imageIndex].classList.remove('active');
    images[index].classList.add('active');
    imageIndex = index;
}

controlls.forEach((e) => {
    e.addEventListener('click', (event) => {
        if (event.target.classList.contains('prev')) {
            let index = imageIndex - 1;

            if (index < 0) {
                index = images.length - 1;
            }

            show(index);
        } else if (event.target.classList.contains('next')) {
            let index = imageIndex + 1;

            if (index >= images.length) {
                index = 0;
            }

            show(index);
        }
    });
});

show(imageIndex);

// Auto-slide every 4 seconds
let autoSlide = setInterval(() => {
    let next = imageIndex + 1;
    if (next >= images.length) next = 0;
    show(next);
}, 4000);

function resetAutoSlide() {
    clearInterval(autoSlide);
    autoSlide = setInterval(() => {
        let next = imageIndex + 1;
        if (next >= images.length) next = 0;
        show(next);
    }, 4000);
}


const resourceCards = document.querySelectorAll('.resources .card');
resourceCards.forEach(card => {
    card.addEventListener('click', (e) => {
        // Prevent expanding if clicking the external link
        if (e.target.closest('.card-link')) return;
        
        const moreInfo = card.querySelector('.card-more');
        const button = card.querySelector('button');
        
        moreInfo.classList.toggle('show');
        
        if (moreInfo.classList.contains('show')) {
            if (button) button.textContent = 'Приховати';
        } else {
            if (button) button.textContent = 'Детальніше';
        }
    });
});

const techniqueCards = document.querySelectorAll('.technique-card, .example-card');
techniqueCards.forEach(card => {
    card.addEventListener('click', (e) => {
        // Don't toggle if clicking a link
        if (e.target.closest('.tech-link-btn')) return;
        const moreInfo = card.querySelector('.card-more');
        const btn = card.querySelector('.expand-btn');
        moreInfo.classList.toggle('show');
        if (btn) btn.classList.toggle('active');
    });
});

function onEntry(entry) {
  entry.forEach(change => {
    if (change.isIntersecting) {
     change.target.classList.add('element-show');
    }
  });
}

let options = {
  threshold: [0.5] };
let observer = new IntersectionObserver(onEntry, options);
let elements = document.querySelectorAll('.element-animation');

for (let elm of elements) {
  observer.observe(elm);
}

// Scroll to top button logic
const scrollToTopBtn = document.getElementById("scrollToTopBtn");

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollToTopBtn.classList.add("show");
    } else {
        scrollToTopBtn.classList.remove("show");
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

// Video Modal logic
const videoModal = document.getElementById('videoModal');
const videoIframe = document.getElementById('videoIframe');
const closeVideoBtn = document.querySelector('.close-video-btn');
const techLinkBtns = document.querySelectorAll('.tech-link-btn');

techLinkBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent card from expanding
        const videoId = btn.getAttribute('data-video');
        if (videoId) {
            videoIframe.src = `https://www.youtube-nocookie.com/embed/${videoId}`;
            videoModal.classList.add('show');
        } else {
            alert('Посилання на відео ще не додано.');
        }
    });
});

const closeModal = () => {
    videoModal.classList.remove('show');
    videoIframe.src = ""; // Stop the video
};

if (closeVideoBtn) {
    closeVideoBtn.addEventListener('click', closeModal);
}

if (videoModal) {
    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) {
            closeModal();
        }
    });
}
