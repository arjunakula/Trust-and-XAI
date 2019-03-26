const answer_key= {
	1: "b",
	2: [],
	3: ["a", "b"],
	4: ["b", "d"],
	5: "c",
	6: ["b", "c"],
	7: ["a", "d"],
	8: "a",
};

window.onload=function(){
	var no_ex_scores = {"PT":0, "NT":0, "R":0, "U":0};
	var attention_scores = {"PT":0, "NT":0, "R":0, "U":0};
	var x_tom_scores = {"PT":0, "NT":0, "R":0, "U":0};

    var answers_dict = JSON.parse(sessionStorage.getItem("wo_explanation_answers"));
    if (answers_dict != null) {
      for (var i = 1; i <= 8; i++) {
        document.getElementById("a".concat(i)).innerHTML = answers_dict[i];
      }
      no_ex_scores = calculateScore(answers_dict);
    }

    answers_dict = JSON.parse(sessionStorage.getItem("attention_maps_answers"));
    if (answers_dict != null) {
      for (var i = 1; i <= 8; i++) {
        document.getElementById("b".concat(i)).innerHTML = answers_dict[i];
      }
      attention_scores = calculateScore(answers_dict);
    }

    answers_dict = JSON.parse(sessionStorage.getItem("x-tom_answers"));
    if (answers_dict != null) {
      for (var i = 1; i <= 8; i++) {
        document.getElementById("c".concat(i)).innerHTML = answers_dict[i];
      }
      x_tom_scores = calculateScore(answers_dict);
    }

	var ctx = document.getElementById("myChart").getContext('2d');
	var myChart = new Chart(ctx, {
	    type: 'bar',
	    data: {
	        labels: ["Positive Trust", "Negative Trust", "Reliance", "User-Machine Performance"],
	        datasets: [{
	            label: 'Without Explanation',
	            data: [no_ex_scores["PT"], no_ex_scores["NT"], no_ex_scores["R"], no_ex_scores["U"]],
	            backgroundColor: 'rgba(100, 100, 200, 0.4',
	            borderColor: 'rgba(100, 100, 200, 0.4)',
	            borderWidth: 1
	        }, {
	            label: 'Attention Maps',
	            data: [attention_scores["PT"], attention_scores["NT"], attention_scores["R"], attention_scores["U"]],
	            backgroundColor: 'rgba(200, 100, 100, 0.4)',
	            borderColor: 'rgba(200, 100, 100, 0.4)',
	            borderWidth: 1
	        }, {
	            label: 'X-ToM',
	            data: [x_tom_scores["PT"], x_tom_scores["NT"], x_tom_scores["R"], x_tom_scores["U"]],
	            backgroundColor: 'rgba(100, 200, 100, 0.4)',
	            borderColor: 'rgba(100, 200, 100, 0.4)',
	            borderWidth: 1
	        }]
	    },
	    options: {
	    	title: {
	    		display: true,
	    		text: "Evaluator Metrics",
	    		fontSize: 45
	    	},
	        scales: {
	            yAxes: [{
	                ticks: {
	                    beginAtZero:true,
	                    fontSize: 30
	                }
	            }],
	           	xAxes: [{
	                ticks: {
	                    fontSize: 30
	                }
	            }]
	        },
	        legend: {
	        	labels: {
	        		fontSize: 35
	        	}
	        }
	    }
	});
};



function calculateScore(answers_dict) {
	var scores = [];
	var q1 = 1 ? answer_key[1] == answers_dict[1] : 0;
	var q5 = 1 ? answer_key[5] == answers_dict[5] : 0;
	var q8 = 1 ? answer_key[8] == answers_dict[8] : 0;
	
	var q2_3 = 0;
	if (q1) { // If 
		var q_i = 2; // if answer to question 1 is yes, look at question 2
		if (answer_key[1] == "b") { // if answer to question 1 is no, look at question 3
			q_i = 3;
		}
		var count = 0;
		for (var i = 0, len = answer_key[q_i].length; i < len; i++) {
			if (answers_dict[q_i].includes(answer_key[q_i][i])) {
				count++;
			}
		}
		q2_3 = count;
	}

	var q4 = 0;
	var count = 0;
	for (var i = 0, len = answer_key[4].length; i < len; i++) {
		if (answers_dict[4].includes(answer_key[4][i])) {
			count++;
		}
	}
	q4 = count;

	var q6 = 0;
	var count = 0;
	for (var i = 0, len = answer_key[6].length; i < len; i++) {
		if (answers_dict[6].includes(answer_key[6][i])) {
			count++;
		}
	}
	q6 = count;

	var q_2_3_4_5_correct = answer_key[2].length + answer_key[3].length + answer_key[4].length + 1;

	var PT = q6 / answer_key[6].length;
	var NT = 1 - PT;
	var R = (q2_3 + q4 + q5) / q_2_3_4_5_correct;
	var U = (q1 + q8) / 2;

	return {
		"PT": PT,
		"NT": NT,
		"R": R,
		"U": U
	}
}

var no_ex_score = [];
var attention_map_score = [];
var x_tom_score = [];