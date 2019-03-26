var csrftoken = Cookies.get('csrftoken');
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

var times = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
var start_time;
var currentTab = 0; // Current tab is set to be the first tab (0)
showTab(currentTab); // Display the current tab

function showTab(n) {
  start_time = new Date().getTime();
  // This function will display the specified tab of the form ...
  var x = document.getElementsByClassName("tab");
  x[n].style.display = "block";
  // ... and fix the Previous/Next buttons:
  if (n == 0) {
    document.getElementById("prevBtn").style.display = "none";
  } else {
    document.getElementById("prevBtn").style.display = "inline";
  }
  if (n == (x.length - 1)) {
    document.getElementById("nextBtn").innerHTML = "Submit";
  } else {
    document.getElementById("nextBtn").innerHTML = "Next";
  }

  if (n == 0 || n == 1) {
    document.getElementById("questionImg").style.display = "none";

    // document.getElementById("questionImg").src = "static/img/question2.PNG";
  } else if (n == 2) {
      document.getElementById("questionImg").style.display = "inline";
    document.getElementById("questionImg").src = "static/img/la6_test/1.PNG";
  }
  else if (n == 3 || n == 4) {
      document.getElementById("questionImg").style.display = "inline";
    document.getElementById("questionImg").src = "static/img/la6_test/2.PNG";
  }
  else if (n == 5 || n == 6) {
      document.getElementById("questionImg").style.display = "inline";
    document.getElementById("questionImg").src = "static/img/la6_test/3.PNG";
  } else {
     document.getElementById("questionImg").style.display = "none";
  }
}

function nextPrev(n) {
  if (currentTab != 0) {
    var curr_time = new Date().getTime();
    var interval = curr_time - start_time;
    times[currentTab-1] += interval;
  }
  // This function will figure out which tab to display
  var x = document.getElementsByClassName("tab");
  // Hide the current tab:
  x[currentTab].style.display = "none";
  // Increase or decrease the current tab by 1:
  currentTab = currentTab + n;
  // if you have reached the end of the form... :
  if (currentTab >= x.length) {
    console.log(times);
    processSaveInputs();
    window.location.replace("finish.html");
    return false;
  }
  // Otherwise, display the correct tab:
  showTab(currentTab);
}

function processSaveInputs() {
    answers_dict = {};
  answers_dict[1] = getCheckboxVals("q1");
  answers_dict[2] = getCheckboxVals("q2");
  answers_dict[3] = getCheckboxVals("q3");
  answers_dict[4] = getCheckboxVals("q4");
  // answers_dict[5] = getCheckboxVals("q5");
  answers_dict[6] = getCheckboxVals("q6");
  answers_dict[7] = getCheckboxVals("q7");
  answers_dict[8] = getRadioVal("q8");
  answers_dict[9] = getRadioVal("q9");
  answers_dict[10] = getRadioVal("q10");
  answers_dict[11] = getRadioVal("q11");
  answers_dict[12] = getRadioVal("q12");
  answers_dict[13] = getRadioVal("q13");
  answers_dict[14] = getRadioVal("q14");
  answers_dict[15] = getRadioVal("q15");
  answers_dict[16] = getRadioVal("q16");
  answers_dict[17] = getRadioVal("q17");
  answers_dict[18] = getRadioVal("q18");
  answers_dict[19] = getTextAreaVal("q19");
  // answers_dict[20] = getTextAreaVal("q20");

  
  answers_dict["c2"] = getConfidenceVals("c2");
  answers_dict["c3"] = getConfidenceVals("c3");
  answers_dict["c4"] = getConfidenceVals("c4");
  // answers_dict["c5"] = getConfidenceVals("c5");
  answers_dict["c6"] = getConfidenceVals("c6");
  answers_dict["c7"] = getConfidenceVals("c7");
  
  answers_dict["t1"] = times[0];
  answers_dict["t2"] = times[1];
  answers_dict["t3"] = times[2];
  answers_dict["t4"] = times[3];
  answers_dict["t5"] = times[4];
  answers_dict["t6"] = times[5];
  answers_dict["t7"] = times[6];
  answers_dict["t8"] = times[7];
  answers_dict["t9"] = times[8];
  answers_dict["t10"] = times[9];


  var type = null;
  var explainer_type = getTextBoxVal("q0");
  type=explainer_type;
  // switch (explainer_type) {
  //   case "no explanation":
  //     type = "wo_explanation_answers";
  //     break;
  //   case "attention maps":
  //     type = "attention_maps_answers";
  //     break;
  //   case "x-tom":
  //     type = "x-tom_answers";
  //     break;
  //   default:
  //     return;
  // }
  sessionStorage.setItem(type, JSON.stringify(answers_dict));
  $.ajax({
        type: "POST",
        url: "saveAnswers",
        dataType: "json",
        data: {"answers": JSON.stringify(answers_dict), "type": type},
        success: function(){
          console.log("saved successfully");
        }
    });
  
}

function getConfidenceVals(name) {
  var e = document.getElementById(name);
  var confidence = e.options[e.selectedIndex].value;
  return confidence;
}

function getCheckboxVals(name) {
  var vals = [];
  var boxes = document.getElementsByName(name);
  for (var i=0, len=boxes.length; i < len; i++) {
    if (boxes[i].checked) {
      vals.push(boxes[i].value);
    }
  }
  return vals;
}

function getRadioVal(name) {
  var radios = document.getElementsByName(name);
  for (var i=0, len=radios.length; i < len; i++) {
    if (radios[i].checked) {
      return radios[i].value;
    }
  }
  return null;
}


function getTextBoxVal(name) {
  var text = document.getElementsByName(name)[0].value;
  console.log(text);
  return text;
}


function getTextAreaVal(name) {
  var text = document.getElementsByName(name).value;
  console.log(text);
  return text;
}