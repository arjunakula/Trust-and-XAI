timer = setInterval(null, 1000);

window.onload=function(){
  console.log("test");
  loopSlides(45000);
}

function loopSlides(interval) {
  var slides = document.getElementsByClassName("mySlides");
  var time = 0;
  for (var n = 0; n < slides.length; n++) {
    setTimeout(showSlides, time, n, interval);
    time += interval;
  }
}

function showSlides(n, interval) {
  var slides = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("dot");

  if (n != slides.length - 1) {
    clearInterval(timer);
    var interval_seconds = Math.floor(interval / 1000);
    document.getElementById("timer").innerHTML = "Time left for this image: " + interval_seconds;
    var start = new Date().getTime();
    timer = setInterval(function() {
      var now = new Date().getTime();
      var distance = now - start;
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);
      var time_left = ((interval_seconds - seconds < 0) ? 0 : interval_seconds-seconds);
      document.getElementById("timer").innerHTML = "Time left for this image: " + time_left;
    }, 1000);
  }


  var i;
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none"; 
  }
  for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[n].style.display = "block"; 
  dots[n].className += " active";
}
