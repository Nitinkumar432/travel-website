$(document).ready(function () {
    const slider = $(".ad-slider");
    const slides = $(".ad-slider img");
    let currentIndex = 0;
  
    // Function to move to the next set of images
    function slideNext() {
      const totalImages = slides.length;
      currentIndex = (currentIndex + 1) % totalImages;
      const translateX = -currentIndex * 33.33 * slider.width() / 100; // Move by 1/3 of the container width (showing 3 images)
      slider.css("transform", `translateX(${translateX}px)`);
    }
  
    setInterval(slideNext, 3000); // Slide every 3 seconds
  });
  