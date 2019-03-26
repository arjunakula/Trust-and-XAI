 

var pgGraphGlobal;
var dotGraph = " digraph G {\n" +
    "\n" +
    "\n" +
    " full_body11[label=\"full body\", personid = 1, frameid= 543, shape = \"oval\", action=\"sitting/standing/walking\", cloth_style=\"half_sleeve\", glass=\"no\", hat=\"no\", hair_style=\"short\", gender=\"male\",age=30,alpha=0.68,beta=0,gamma=0,XUtility=\"0.5\",alpha_normalized =  0.43 ,beta_normalized =  0.46 ,gamma_normalized =  0.11]\n" +
    " upper_body11[label=\"upper body\", personid = 1, frameid= 543, shape = \"oval\", action=\"standing/sitting/walking\", cloth_style=\"half_sleeve\", glass=\"no\", hat=\"no\", hair_style=\"short\", gender=\"male\",age=30,alpha=0.73,beta=0.92,gamma=0.2, XUtility=\"0.5\",alpha_normalized =  0.53 ,beta_normalized =  0.33 ,gamma_normalized =  0.13]\n" +
    " lower_body11[label=\"lower body\", personid = 1, frameid= 543, shape = \"oval\", action=\"\", cloth_style=\"\", glass=\"\", hat=\"\", hair_style=\"\", gender=\"\",age=\"\",alpha=0.7,beta=0,gamma=0.84,XUtility=\"0.5\",alpha_normalized =  0.0 ,beta_normalized =  0.0 ,gamma_normalized =  1.0]\n" +
    " head11[label=\"head\", personid = 1, frameid= 543, shape = \"oval\", action=\"\", cloth_style=\"\", glass=\"no\", hat=\"no\", hair_style=\"short\", gender=\"male\",age=30,alpha=0.93,beta=0,gamma=0.9,alpha_normalized =  0.16 ,beta_normalized =  0.0 ,gamma_normalized =  0.84]\n" +
     " neck11[label=\"neck\", personid = 1, frameid= 543, shape = \"oval\", action=\"\", cloth_style=\"\", glass=\"no\", hat=\"no\", hair_style=\"short\", gender=\"male\",age=30,alpha=0.68,beta=0,gamma=0.7,alpha_normalized =  0.16 ,beta_normalized =  0.0 ,gamma_normalized =  0.84]\n" +
   
    " left_arm11[label=\"left arm\", personid = 1, frameid= 543, shape = \"oval\", action=\"standing/sitting/walking\", cloth_style=\"half_sleeve\", glass=\"\", hat=\"\", hair_style=\"\", gender=\"\",age=\"\",alpha=0.783,beta=0,gamma=0.79,XUtility=\"0.7\",alpha_normalized =  0.87 ,beta_normalized =  0.0 ,gamma_normalized =  0.13]\n" +
    " right_arm11[label=\"right arm\", personid = 1, frameid= 543, shape = \"oval\", action=\"standing/sitting/walking\", cloth_style=\"half_sleeve\", glass=\"\", hat=\"\", hair_style=\"\", gender=\"\",age=\"\",XUtility=\"0.53\",alpha=0.8,beta=0,gamma=0.76,alpha_normalized =  0.98 ,beta_normalized =  0.0 ,gamma_normalized =  0.02]\n" +
    " torso11[label=\"torso\", personid = 1, frameid= 543, shape = \"oval\", action=\"sitting/standing/walking\", cloth_style=\"half_sleeve\", glass=\"\", hat=\"\", hair_style=\"short\", gender=\"male\",age=\"\",alpha=0.824,beta=0,gamma=0,XUtility=\"0.93\",alpha_normalized =  0.69 ,beta_normalized =  0.0 ,gamma_normalized =  0.31]\n" +
    " left_leg11[label=\"left leg\", personid = 1, frameid= 543, shape = \"oval\", action=\"\", cloth_style=\"\", glass=\"\", hat=\"\", hair_style=\"\", gender=\"\",age=\"\",alpha=0.79,beta=0.92,gamma=0.75,alpha_normalized =  0.0 ,beta_normalized =  0.0 ,gamma_normalized =  1.0]\n" +
    " right_leg11[label=\"right leg\", personid = 1, frameid= 543, shape = \"oval\", action=\"\", cloth_style=\"\", glass=\"\", hat=\"\", hair_style=\"\", gender=\"\",age=\"\",alpha=0.8,beta=0,gamma=0.78,alpha_normalized =  0.0 ,beta_normalized =  0.0 ,gamma_normalized =  1.0]\n" +
    " right_elbow11[label=\"right elbow\", personid = 1, frameid= 543, shape = \"oval\", action=\"\", cloth_style=\"\", glass=\"\", hat=\"\", hair_style=\"\", gender=\"\",age=\"\",alpha=0.78,beta=0,gamma=0.73,alpha_normalized =  0.0 ,beta_normalized =  0.0 ,gamma_normalized =  1.0]\n" +
    " right_shoulder11[label=\"right shoulder\", personid = 1, frameid= 543, shape = \"oval\", action=\"\", cloth_style=\"\", glass=\"\", hat=\"\", hair_style=\"\", gender=\"\",age=\"\",alpha=0.85,beta=0,gamma=0.78,alpha_normalized =  0.0 ,beta_normalized =  0.0 ,gamma_normalized =  1.0]\n" +
    " right_wrist11[label=\"right wrist\", personid = 1, frameid= 543, shape = \"oval\", action=\"\", cloth_style=\"\", glass=\"\", hat=\"\", hair_style=\"\", gender=\"\",age=\"\",alpha=0.97,beta=0,gamma=0.93,alpha_normalized =  0.0 ,beta_normalized =  0.0 ,gamma_normalized =  1.0]\n" +
    " left_elbow11[label=\"left elbow\", personid = 1, frameid= 543, shape = \"oval\", action=\"\", cloth_style=\"\", glass=\"\", hat=\"\", hair_style=\"\", gender=\"\",age=\"\",alpha=0.7,beta=0.8,gamma=0.6,alpha_normalized =  0.0 ,beta_normalized =  0.0 ,gamma_normalized =  1.0]\n" +
    " left_shoulder11[label=\"left shoulder\", personid = 1, frameid= 543, shape = \"oval\", action=\"\", cloth_style=\"\", glass=\"\", hat=\"\", hair_style=\"\", gender=\"\",age=\"\",alpha=0.69,beta=0.84,gamma=0.73,alpha_normalized =  0.0 ,beta_normalized =  0.0 ,gamma_normalized =  1.0]\n" +
    " left_wrist11[label=\"left wrist\", personid = 1, frameid= 543, shape = \"oval\", action=\"\", cloth_style=\"\", glass=\"\", hat=\"\", hair_style=\"\", gender=\"\",age=\"\",alpha=0.73,beta=0.72,gamma=0.18,alpha_normalized =  0.0 ,beta_normalized =  0.0 ,gamma_normalized =  1.0]\n" +
    " left_hip11[label=\"left hip\", personid = 1, frameid= 543, shape = \"oval\", action=\"\", cloth_style=\"\", glass=\"\", hat=\"\", hair_style=\"\", gender=\"\",age=\"\",alpha=0.7,beta=0,gamma=0.6,alpha_normalized =  0.0 ,beta_normalized =  0.0 ,gamma_normalized =  1.0]\n" +
    " left_knee11[label=\"left knee\", personid = 1, frameid= 543, shape = \"oval\", action=\"\", cloth_style=\"\", glass=\"\", hat=\"\", hair_style=\"\", gender=\"\",age=\"\",alpha=0.82,beta=0.82,gamma=0.83,alpha_normalized =  0.0 ,beta_normalized =  0.0 ,gamma_normalized =  1.0]\n" +
    " left_ankle11[label=\"left ankle\", personid = 1, frameid= 543, shape = \"oval\", action=\"\", cloth_style=\"\", glass=\"\", hat=\"\", hair_style=\"\", gender=\"\",age=\"\",alpha=0.92,beta=0.9,gamma=0.88,alpha_normalized =  0.0 ,beta_normalized =  0.0 ,gamma_normalized =  1.0]\n" +
    " right_hip11[label=\"right hip\", personid = 1, frameid= 543, shape = \"oval\", action=\"\", cloth_style=\"\", glass=\"\", hat=\"\", hair_style=\"\", gender=\"\",age=\"\",alpha=0.78,beta=0.79,gamma=0.76,alpha_normalized =  0.0 ,beta_normalized =  0.0 ,gamma_normalized =  1.0]\n" +
    " right_knee11[label=\"right knee\", personid = 1, frameid= 543, shape = \"oval\", action=\"\", cloth_style=\"\", glass=\"\", hat=\"\", hair_style=\"\", gender=\"\",age=\"\",alpha=0.89,beta=0,gamma=0.8,alpha_normalized =  0.0 ,beta_normalized =  0.0 ,gamma_normalized =  1.0]\n" +
    " right_ankle11[label=\"right ankle\", personid = 1, frameid= 543, shape = \"oval\", action=\"\", cloth_style=\"\", glass=\"\", hat=\"\", hair_style=\"\", gender=\"\",age=\"\",alpha=0.92,beta=0.82,gamma=0.85,alpha_normalized =  0.0 ,beta_normalized =  0.0 ,gamma_normalized =  1.0]\n" +
    "\n" +
    " full_body11 -> upper_body11;\n" +
    " upper_body11 -> left_arm11;\n" +
    " upper_body11 -> right_arm11;\n" +
    " right_arm11 -> right_elbow11;\n" +
    " right_arm11 -> right_shoulder11;\n" +
    " right_arm11 -> right_wrist11;\n" +
    " left_arm11 -> left_elbow11;\n" +
    " left_arm11 -> left_shoulder11;\n" +
    " left_arm11 -> left_wrist11;\n" +
    " upper_body11 -> torso11 -> head11\n" +
    " upper_body11 -> torso11 ->neck11\n" +
    " full_body11 -> lower_body11\n" +
    " lower_body11 -> left_leg11\n" +
    " lower_body11 -> right_leg11\n" +
    " left_leg11 -> left_hip11;\n" +
    " left_leg11 -> left_knee11;\n" +
    " left_leg11 -> left_ankle11;\n" +
    " right_leg11 -> right_hip11;\n" +
    " right_leg11 -> right_knee11;\n" +
    " right_leg11 -> right_ankle11;\n" +
    " }\n";


var explanation1 = {
    "parsegraph": "digraph G{ person21 [ gamma_normalized=\"0.17\", personid=\"15\", gender=\"male\", age=\"30\", alpha_normalized=\"0.33\", beta=\"0.6\", frameid=\"1430\", glass=\"no\", shape=\"oval\", hair_style=\"short\", cloth_style=\"tshirt-jeans\", alpha=\"0.4\", action=\"sitting/standing/walking\", beta_normalized=\"0.5\", label=\"person 15\", hat=\"no\", gamma=\"0.2\", XUtility=\"0.5\" ]   scene_2 [ shape=\"diamond\", label=\"scene_2:chatting\" ] scene_2->person21;}",
    "highlights": ["person21", "scene_2", "full_body21"],
    "mainnodes":["person21","full_body21"],
    "mainedges": ["person21:full_body21"]
};

var explanation2 = {
    "parsegraph": "digraph G{ person21 [ gamma_normalized=\"0.17\", personid=\"15\", gender=\"male\", age=\"30\", alpha_normalized=\"0.33\", beta=\"0.6\", frameid=\"1430\", glass=\"no\", shape=\"oval\", hair_style=\"short\", cloth_style=\"tshirt-jeans\", alpha=\"0.4\", action=\"sitting/standing/walking\", beta_normalized=\"0.5\", label=\"person 15\", hat=\"no\", gamma=\"0.2\", XUtility=\"0.5\" ]   scene_2 [ shape=\"diamond\", label=\"scene_2:chatting\" ] scene_2->person21;}",
    "highlights": ["person22", "scene_2", "full_body21"],
    "mainnodes":["person22","full_body22"],
    "mainedges": ["person22:full_body22"]
};
var explanation3 = {
    "parsegraph": "digraph G{ person21 [ gamma_normalized=\"0.17\", personid=\"15\", gender=\"male\", age=\"30\", alpha_normalized=\"0.33\", beta=\"0.6\", frameid=\"1430\", glass=\"no\", shape=\"oval\", hair_style=\"short\", cloth_style=\"tshirt-jeans\", alpha=\"0.4\", action=\"sitting/standing/walking\", beta_normalized=\"0.5\", label=\"person 15\", hat=\"no\", gamma=\"0.2\", XUtility=\"0.5\" ]   scene_2 [ shape=\"diamond\", label=\"scene_2:chatting\" ] scene_2->person21;}",
    "highlights": ["person21", "scene_2", "full_body21"],
    "mainnodes":["full_body32", "lower_body32"],
    "mainedges": ["full_body32:lower_body32"]
};
var explanation4 = {
    "parsegraph": "digraph G{ person21 [ gamma_normalized=\"0.17\", personid=\"15\", gender=\"male\", age=\"30\", alpha_normalized=\"0.33\", beta=\"0.6\", frameid=\"1430\", glass=\"no\", shape=\"oval\", hair_style=\"short\", cloth_style=\"tshirt-jeans\", alpha=\"0.4\", action=\"sitting/standing/walking\", beta_normalized=\"0.5\", label=\"person 15\", hat=\"no\", gamma=\"0.2\", XUtility=\"0.5\" ]   scene_2 [ shape=\"diamond\", label=\"scene_2:chatting\" ] scene_2->person21;}",
    "highlights": ["person21", "scene_2", "full_body21"],
    "mainnodes":["torso32", "head32"],
    "mainedges": ["torso32:head32"]
}; 


function  renderParseGraph(explanationAOG, explanationAinB, explanationXAOG) {
        var jp1 = dot2json(explanationAOG.parsegraph);
        var jp2 = dot2json(explanationAinB.parsegraph);
        var jp3 = dot2json(explanationXAOG.parsegraph);


        d3.selectAll("svg").remove()
        d3.selectAll("#tooltipPg").remove()
        d3.selectAll("#tipDiv").remove()
        pgGraphGlobal = new ParseGraphRender("#canvas-aog", 450, 400, 12);
        pgGraphGlobal2 = new ParseGraphRender("#canvas-aog-BinA", 450, 300, 12);
        pgGraphGlobal3 = new ParseGraphRender("#canvas-aog-XAOG", 900, 400, 12);
        pgGraphGlobal.drawGraph(jp1.root);

        if (jp2.root) {
            pgGraphGlobal2.drawGraph(jp2.root);        
            if (explanationAinB.mainnodes) {
            pgGraphGlobal2.highlightNode(explanationAinB.mainnodes)
            }
            if (explanationAinB.mainedges) {
                pgGraphGlobal2.highlightEdge(explanationAinB.mainedges)
            }
        }
        if (jp3.root) {
            pgGraphGlobal3.drawGraph(jp3.root);
            if (explanationXAOG.mainnodes) {
            pgGraphGlobal3.highlightNode(explanationXAOG.mainnodes)
            }
            if (explanationXAOG.mainedges) {
                pgGraphGlobal3.highlightEdge(explanationXAOG.mainedges)
            }
        }
        if (explanationAOG.mainnodes) {
            pgGraphGlobal.highlightNode(explanationAOG.mainnodes)
        }
        if (explanationAOG.mainedges) {
            pgGraphGlobal.highlightEdge(explanationAOG.mainedges)
        }

}
