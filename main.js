const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {

      // progress bars
      document.querySelectorAll(".progress-animate").forEach(bar => {
        bar.style.width = bar.getAttribute("data-width") + "%";
      });

      // counters
      document.querySelectorAll(".counter").forEach(counter => {
        let target = +counter.getAttribute("data-target");
        let count = 0;

        let interval = setInterval(() => {
          if (count >= target) {
            clearInterval(interval);
          } else {
            count++;
            counter.innerText = count + "%";
          }
        }, 20);
      });

      observer.disconnect();
    }
  });
});

observer.observe(document.querySelector(".col-md-5"));

// night mode btn
const themeBtn = document.getElementById("themeToggle");

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");

    if(document.body.classList.contains("dark-mode")){
        localStorage.setItem("theme","dark");
        themeBtn.innerHTML =
        '<i class="fa-solid fa-sun"></i>';
    }else{
        localStorage.setItem("theme","light");
        themeBtn.innerHTML =
        '<i class="fa-solid fa-moon"></i>';
    }

});

if(localStorage.getItem("theme") === "dark"){

    document.body.classList.add("dark-mode");

    themeBtn.innerHTML =
    '<i class="fa-solid fa-sun"></i>';
}
