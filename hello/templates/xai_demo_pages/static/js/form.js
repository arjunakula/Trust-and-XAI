var currentTab = 0; // Current tab is set to be the first tab (0)
showTab(currentTab); // Display the current tab

function showTab(n) {
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

  if (n == 4 || n == 5) {
    document.getElementById("questionImg").src = "static/img/question2.png";
  } else if (n == 8) {
    document.getElementById("questionImg").src = "static/img/question3.png";
  } else {
    document.getElementById("questionImg").src = "static/img/question1.png";
  }
}

function nextPrev(n) {
  // This function will figure out which tab to display
  var x = document.getElementsByClassName("tab");
  // Hide the current tab:
  x[currentTab].style.display = "none";
  // Increase or decrease the current tab by 1:
  currentTab = currentTab + n;
  // if you have reached the end of the form... :
  if (currentTab >= x.length) {
    processInputs();
    window.location.replace("evaluator_results.html");
    return false;
  }
  // Otherwise, display the correct tab:
  showTab(currentTab);
}

function processInputs() {
  answers_dict = {};
  answers_dict[1] = getCheckboxVals("q1");
  answers_dict[2] = getCheckboxVals("q2");
  answers_dict[3] = getCheckboxVals("q3");
  answers_dict[4] = getCheckboxVals("q4");
  answers_dict[5] = getCheckboxVals("q5");
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
  answers_dict[19] = getTextVal("q19");
  answers_dict[20] = getTextVal("q20");

//la6-1, la6-2, la6-3
  var explainer_type = getTextVal("q0");
  sessionStorage.setItem(explainer_type, JSON.stringify(answers_dict));
  // switch (explainer_type) {
  //   case "la6qa1":
  //     sessionStorage.setItem("la6qa1", JSON.stringify(answers_dict));
  //     break;
  //   case "la6att2":
  //     sessionStorage.setItem("la6att2", JSON.stringify(answers_dict));
  //     break;
  //   case "la6xtm3":
  //     sessionStorage.setItem("la6xtm3", JSON.stringify(answers_dict));
  //     break;
  //   default:
  //     break;
  // }
  
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
  var text = document.getElementsByName(name);
  
  return text;
}