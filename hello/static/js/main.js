function genStorylineID() {
  var s = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  var sid = "";
  for (var i = 0; i < 6; ++i)
    sid += s[Math.floor(Math.random()*s.length)];
  return sid;
}

function formatXml(xml) {
  var formatted = '';
  var reg = /(>)(<)(\/*)/g;
  xml = xml.replace(reg, '$1\r\n$2$3');
  var pad = 0;
  jQuery.each(xml.split('\r\n'), function(index, node){
    var indent = 0;
    if (node.match( /.+<\/\w[^>]*>$/ )) {
      indent = 0;
    } else if (node.match( /^<\/\w/ )) {
      if (pad != 0) {
        pad -= 1;
      }
    } else if (node.match( /^<\w[^>]*[^\/]>.*$/ )){
      indent = 1;
    } else {
      indent = 0;
    }
    var padding = '';
    for (var i = 0; i < pad; i++){
        padding += '  ';
    }
    formatted += padding + node + '\r\n';
    pad += indent;
  });
  return formatted;
}

// Description
//  Synchronously retries the contents of the file specified by the URI.
// Arguments
//  uri - URI location of the file
// Return
//  Contents of the file as a string.
function get_file(uri)
{
    var req = new XMLHttpRequest();
    req.open("GET", uri, false);
    req.send();
    if (req.status != 200)
    {
        return null;
    }

    return req.responseText;
}

var AT = new THREE.Matrix4(), ATInv = new THREE.Matrix3();
var bT = new THREE.Vector3();
var vScale = 1024/1920;

AT.set(
  391.1798, 519.1131, 0, 0,
  72.2466, -54.4417, 0, 0,
  -0.7909, 0.5960, -1, 0,
  0, 0, 0, 1
);

function get3Dpos(x, y) {
  AT.elements[8] = 512 - x*vScale;
  AT.elements[9] = 288 - y*vScale;
  ATInv.getInverse(AT);
  bT.set(0, -965.5114, -0.2088);
  bT.applyMatrix3(ATInv);
  return [bT.x, bT.y, 0];
}

var mv3d;

function shortViewId(viewId) {
  return viewId.toLowerCase().replace('view-', '');
}

$(document).ready(function(){
  var storylineID = genStorylineID();
  var videoCol = Math.floor(12 / Object.keys(socMetadata['views']).length);
  var videoIdx = 0;
  var vs = [];
  for (var i = 1; i <= Object.keys(socMetadata['views']).length; i += 2) {
    $('#videos').append(
      $('<div>', {
        class: 'row'
      }).append(
        $('<div>', {
          id: 'video-' + i,
          class: 'col-md-6 video-div',
        })
      ).append(
        $('<div>', {
          id: 'video-' + (i+1),
          class: 'col-md-6 video-div',
        })
      )
    );
  }

  // Hide heat map and tooltip.
  $('#panel-answer-graph').mouseleave(function() {
    $('#hm-pg-img').hide();
  });

  for (var e in socMetadata['views']) {
    var st = socMetadata['views'][e].start_time;
    var startTime = new Date(Date.UTC(st.Y, st.M-1, st.D, st.h, st.m, st.s, st.ms) + 420*60000); // fix timezone
    var endTime = new Date(Math.round(startTime) + socMetadata['views'][e].num_frames*1000/socMetadata['views'][e].fps);
    var opt = {
      videoUrl: socMetadata['views'][e].url,
      videoWidth: socMetadata['views'][e].width,
      videoHeight: socMetadata['views'][e].height,
      allScript: socMetadata['views'][e].allScript,
      startTime: startTime,
      endTime: endTime,
      fps: socMetadata['views'][e].fps,
      keepRatio: false,
    };

    vs.push({
      'viewId': e,
      'shortViewId': shortViewId(e),
      'container': 'video-'+(++videoIdx),
      'opt': opt,
    });
  }

  var videoGroup = new MSEEVideoGroup(vs);
  videoGroup.ui.addGlobalControl('main-vc');
  videoGroup.loadAllScript();
  setTimeout(function(){
    // setInterval(function(){
      videoGroup.showLabels();
    // }, 1000);
  }, 2000);

  var ptrCurTime = videoGroup.getGlobalTime();
  var ptrStartTime = videoGroup.startTime;
  var ptrEndTime = videoGroup.endTime;

  function getTimeStr(gt) {
    var t = new Date(gt - gt.getTimezoneOffset()*60*1000);
    return t.toISOString().slice(11,-1);
  }
  $('#ptr-start').val(getTimeStr(ptrStartTime));
  $('#ptr-end').val(getTimeStr(ptrEndTime));
  $('#ptr-tr').val($('#ptr-start').val() + ' ~ ' + $('#ptr-end').val());
  setInterval(function(){
    ptrCurTime = videoGroup.getGlobalTime();
    $('#ptr-cur').val(getTimeStr(ptrCurTime));
  }, 80);

  $('#ptr-set-start').click(function(){
    ptrStartTime = ptrCurTime;
    $('#ptr-start').val(getTimeStr(ptrStartTime));
    videoGroup.ui.displayTimeRange('main-vc', ptrStartTime, ptrEndTime);
    $('#ptr-tr').val($('#ptr-start').val() + ' ~ ' + $('#ptr-end').val());
  });

  $('#ptr-set-end').click(function(){
    ptrEndTime = ptrCurTime;
    $('#ptr-end').val(getTimeStr(ptrEndTime));
    videoGroup.ui.displayTimeRange('main-vc', ptrStartTime, ptrEndTime);
    $('#ptr-tr').val($('#ptr-start').val() + ' ~ ' + $('#ptr-end').val());
  });

  // $('#ptr-change').click(function(){
  //   $('#p-time-range').slideDown('slow');
  // });

  // $('#ptr-tr-div').hide();
  // var ptrStr = ["Select Time Range", "Delete Time Range"];
  // $('#ptr-tog').click(function(){
  //   $('#ptr-tr-div').toggle();
  //   $('#p-time-range').toggle('slow');
  //   $(this).attr('data-b', 1-$(this).attr('data-b'));
  //   $(this).html(ptrStr[$(this).attr('data-b')]);
  // })
  $('#tr-create-new').click(function() {
    $('#p-time-range').slideDown('slow');
  });

  var trMgr = new MSEETimeRangeManager();
  trMgr.ui.createTimeRangesDropdown('q-tr');
  var trw = new MSEETimeRange('Whole', videoGroup.startTime, videoGroup.endTime);
  trMgr.addTimeRange(trw);
  $('#ptr-tr').html(trw.getStr());
  var queryTimeRange = trw;

  $('#ptr-set-name').click(function(){
    var trname = $('#ptr-name').val();
    if (trname) {
      var nt = new MSEETimeRange(trname, ptrStartTime, ptrEndTime);
      // console.log(nt.name);
      trMgr.addTimeRange(nt);
      // console.log(trMgr.timeRanges);
    }
  });

  $('#'+cid+'-timeranges-dropdown-ul').on('click', 'a', function(){
    var trname = $(this).attr('data-trname');
    queryTimeRange = trMgr.timeRanges[trname];
    $('#ptr-tr').html(queryTimeRange.getStr());
  });

  function render3D(data) {
      var camera, scene, renderer, particles, geometry, material;
      var container = $('#vis-3d');
      var mouseX = 0, mouseY = 0;
      var w = container.width(), h = container.height();
      var windowHalfX = w / 2;
      var windowHalfY = h / 2;
      var anims = {};

      init_anims();
      init();
      animate();


      function init() {
        camera = new THREE.PerspectiveCamera(55, w / h, 2, 1000000);
        camera.position.x = 40;
        camera.position.y = 60;
        camera.position.z = 65;

        scene = new THREE.Scene();
        geometry = new THREE.Geometry();
        colors = [];
        for (var i = 0; i < data.length; i ++ ) {
          var vertex = new THREE.Vector3();
          // Switch Y and Z. Y for height, -Z for depth.
          vertex.x = data[i][0]*10 + 50;
          vertex.y = data[i][2]*10;
          vertex.z = -data[i][1]*10;
          // if (i%100==0)
          //   console.log(vertex.x, vertex.y, vertex.z);
          colors[i] = new THREE.Color('rgb('+data[i][3]+','+data[i][4]+','+data[i][5]+')');
          geometry.vertices.push( vertex );
        }
        geometry.colors = colors;
        material = new THREE.PointsMaterial({
          size: 2, alphaTest: 0.5, transparent: true, vertexColors: THREE.VertexColors});
        particles = new THREE.Points(geometry, material);
        scene.add(particles);

        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(w, h);
        renderer.setClearColor(0xffffff);
        container.append(renderer.domElement);
        container.mousemove(onDocumentMouseMove);
        // document.addEventListener('mousemove', onDocumentMouseMove, false);
        // window.addEventListener('resize', onWindowResize, false);

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = false;
        controls.maxPolarAngle = Math.PI/2; // prevent flipping under the ground.

        showPerson3D();
        // showAxes(100);
        showSky();
      }

      function init_anims() {
        var BIKE_WHEEL_RADIUS = 0.3;
        var BIKE_WHEEL_SPACING = 0.35;

        // var global_scale = 2.5;
        // var global_scale_M = new THREE.Matrix4();
        // global_scale_M.makeScale(this.global_scale, this.global_scale, this.global_scale);

        // Load the animation mapping
        var anim_map = JSON.parse(get_file("/static/viz_3d/anim_map.json"));

        // Generate all the models this visualization will use
        for (var i = 0; i < anim_map.length; i++) {
          var object_label = anim_map[i].object_label;
          anims[object_label] = {};

          if (object_label == "OBJ_PERSON") {
            // Generate the animated skeleton
            for (var j = 0; j < anim_map[i].actions.length; j++) {
              var action_label = anim_map[i].actions[j].label;
              anims[object_label][action_label] = {};
              anims[object_label][action_label].frames = [];

              // Generated the skeletons for each frame
              var anim = JSON.parse(get_file(anim_map[i].actions[j].uri));
              for (var frame = 0; frame < anim.frames.length; frame++) {
                var geom = generate_skeleton_geometry(anim.frames[frame].joint);
                // geom.applyMatrix(global_scale_M);

                anims[object_label][action_label].frames.push(geom);
              }

              // Calculate the point where the gaze will be placed
              anims[object_label][action_label].gaze_z = (anim.frames[0].joint[2].z + anim.frames[0].joint[3].z) / 2.0;
            }
          } else if (object_label == "OBJ_VEHICLE_TWO_WHEELED") {
            anims[object_label].DEFAULT = {};
            anims[object_label].DEFAULT.frames = [];

            // Create the wheels of the bicycle.
            var wheel1 = new THREE.CylinderGeometry( BIKE_WHEEL_RADIUS, BIKE_WHEEL_RADIUS, 0.02, 16);
            var wheel2 = wheel1.clone();
            wheel1.applyMatrix(new THREE.Matrix4().makeTranslation(BIKE_WHEEL_SPACING, 0.0, BIKE_WHEEL_RADIUS));
            wheel2.applyMatrix(new THREE.Matrix4().makeTranslation(-BIKE_WHEEL_SPACING, 0.0, BIKE_WHEEL_RADIUS));
            THREE.GeometryUtils.merge(wheel1, wheel2);
            // wheel1.applyMatrix(global_scale_M);

            anims[object_label].DEFAULT.frames.push(wheel1);
          } else if (object_label == "HACK_BICYCLE") {
            // Generate the animated skeleton
            for (var j = 0; j < anim_map[i].actions.length; j++) {
              var action_label = anim_map[i].actions[j].label;
              anims[object_label][action_label] = {};
              anims[object_label][action_label].frames = [];

              // Generated the skeletons for each frame
              var anim = JSON.parse(get_file(anim_map[i].actions[j].uri));
              for (var frame = 0; frame < anim.frames.length; frame++) {
                var geom = generate_skeleton_geometry(anim.frames[frame].joint);

                // Create the wheels of the bicycle.
                var wheel1 = new THREE.CylinderGeometry( BIKE_WHEEL_RADIUS, BIKE_WHEEL_RADIUS, 0.02, 16);
                var wheel2 = wheel1.clone();
                wheel1.applyMatrix(new THREE.Matrix4().makeTranslation(BIKE_WHEEL_SPACING, 0.0, BIKE_WHEEL_RADIUS));
                wheel2.applyMatrix(new THREE.Matrix4().makeTranslation(-BIKE_WHEEL_SPACING, 0.0, BIKE_WHEEL_RADIUS));
                THREE.GeometryUtils.merge(geom, wheel1);
                THREE.GeometryUtils.merge(geom, wheel2);

                // geom.applyMatrix(global_scale_M);

                anims[object_label][action_label].frames.push(geom);
              }

              // Calculate the point where the gaze will be placed
              anims[object_label][action_label].gaze_z = (anim.frames[0].joint[2].z + anim.frames[0].joint[3].z) / 2.0;
            }
          } else if (object_label == "OBJ_VEHICLE_AUTOMOBILE") {
            // Generate a car-shaped box
            anims[object_label].DEFAULT = {};
            anims[object_label].DEFAULT.frames = [];
            var vehicle_geom = new THREE.BoxGeometry(3.6, 1.8, 1.2);
            vehicle_geom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 0.6 + 0.25));

            var wheel1 = new THREE.CylinderGeometry( 0.35, 0.35, 0.2, 16);
            var wheel2 = wheel1.clone();
            var wheel3 = wheel1.clone();
            var wheel4 = wheel1.clone();
            wheel1.applyMatrix(new THREE.Matrix4().makeTranslation(0.9, 1, 0.35));
            wheel2.applyMatrix(new THREE.Matrix4().makeTranslation(-0.9, 1, 0.35));
            wheel3.applyMatrix(new THREE.Matrix4().makeTranslation(0.9, -1, 0.35));
            wheel4.applyMatrix(new THREE.Matrix4().makeTranslation(-0.9, -1, 0.35));
            THREE.GeometryUtils.merge(vehicle_geom, wheel1);
            THREE.GeometryUtils.merge(vehicle_geom, wheel2);
            THREE.GeometryUtils.merge(vehicle_geom, wheel3);
            THREE.GeometryUtils.merge(vehicle_geom, wheel4);
            anims[object_label].DEFAULT.frames.push(vehicle_geom);
            anims[object_label].DEFAULT.gaze_z = 0.04;
          } else if (object_label == "OBJ_SMALL_OBJECT") {
            anims[object_label].DEFAULT = {};
            anims[object_label].DEFAULT.frames = [];
            //var default_geom = new THREE.BoxGeometry(0.5, 0.5, 0.5);
            var default_geom = new THREE.SphereGeometry( 0.25, 16, 16);
            default_geom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 0.25));
            anims[object_label].DEFAULT.frames.push(default_geom);
          } else if (object_label == "OBJ_ANIMAL") {
            anims[object_label].DEFAULT = {};
            anims[object_label].DEFAULT.frames = [];
            var default_geom = new THREE.BoxGeometry(0.5, 0.5, 0.7);
            default_geom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 0.35));
            anims[object_label].DEFAULT.frames.push(default_geom);
          } else if (object_label == "OBJ_SEAT") {
            anims[object_label].DEFAULT = {};
            anims[object_label].DEFAULT.frames = [];
            var default_geom = new THREE.CylinderGeometry( 0.3, 0.3, 0.4, 6 );
            default_geom.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
            default_geom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 0.25));
            anims[object_label].DEFAULT.frames.push(default_geom);
          } else {
            // Default objects are represented by a cuboid
            anims[object_label].DEFAULT = {};
            anims[object_label].DEFAULT.frames = [];
            var default_geom = new THREE.BoxGeometry(0.5, 0.5, 0.7);
            default_geom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 0.35));
            anims[object_label].DEFAULT.frames.push(default_geom);
            /*
            anims[object_label].DEFAULT = {};
            anims[object_label].DEFAULT.frames = [];
            var default_geom = new THREE.BoxGeometry(1, 1, 1.6);
            default_geom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 0.8));
            anims[object_label].DEFAULT.frames.push(default_geom);
            */
          }
        }
      }

      // Description:
      //  Generate the geometry from skeleton joint data.
      // Arguments
      //  joint_data - skeleton joint data
      //  scale_factor - value used to scale the model
      function generate_skeleton_geometry(joint_data){
        var geom = new THREE.Geometry();
        THREE.GeometryUtils.merge(geom, generate_bone(joint_data, 0, 1));
        THREE.GeometryUtils.merge(geom, generate_bone(joint_data, 0, 2));
        THREE.GeometryUtils.merge(geom, generate_bone(joint_data, 3, 2));
        THREE.GeometryUtils.merge(geom, generate_bone(joint_data, 2, 4));
        THREE.GeometryUtils.merge(geom, generate_bone(joint_data, 2, 8));
        THREE.GeometryUtils.merge(geom, generate_bone(joint_data, 4, 5));
        THREE.GeometryUtils.merge(geom, generate_bone(joint_data, 5, 6));
        THREE.GeometryUtils.merge(geom, generate_bone(joint_data, 9, 8));
        THREE.GeometryUtils.merge(geom, generate_bone(joint_data, 9, 10));
        THREE.GeometryUtils.merge(geom, generate_bone(joint_data, 0, 12));
        THREE.GeometryUtils.merge(geom, generate_bone(joint_data, 13, 12));
        THREE.GeometryUtils.merge(geom, generate_bone(joint_data, 13, 14));
        THREE.GeometryUtils.merge(geom, generate_bone(joint_data, 0, 16));
        THREE.GeometryUtils.merge(geom, generate_bone(joint_data, 17, 16));
        THREE.GeometryUtils.merge(geom, generate_bone(joint_data, 17, 18));

        geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
        return geom;
      }

      // Description:
      //  Creates a bone (cylinder) between two points in the skeleton joint data.
      // Arguments
      //  joint_data - skeleton joint data
      //  idx1 - index of first joint
      //  idx2 - index of second joint
      function generate_bone (joint_data, idx1, idx2) {
        var BONE_RADIUS = 0.05;
        var p1 = new THREE.Vector3(joint_data[idx1].x, joint_data[idx1].y, joint_data[idx1].z);
        var p2 = new THREE.Vector3(joint_data[idx2].x, joint_data[idx2].y, joint_data[idx2].z);
        var height = p1.distanceTo(p2);
        var geom = new THREE.CylinderGeometry( BONE_RADIUS, BONE_RADIUS, height, 4 );

        var quaternion = new THREE.Quaternion();
        var v = new THREE.Vector3();
        v.subVectors(p2, p1);
        v.normalize();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v);

        var T1 = new THREE.Matrix4().makeTranslation(BONE_RADIUS, height / 2, 0);
        var R = new THREE.Matrix4().makeRotationFromQuaternion(quaternion);
        var T2 = new THREE.Matrix4().makeTranslation(p1.x, p1.y, p1.z);

        geom.applyMatrix(T1);
        geom.applyMatrix(R);
        geom.applyMatrix(T2);

        return geom;
      }

      function showSky(){
        var vertexShader = document.getElementById('skyVertexShader').textContent;
        var fragmentShader = document.getElementById('skyFragmentShader').textContent;
        var uniforms = {
          topColor:    { type: "c", value: new THREE.Color(0x212830)},
          bottomColor: { type: "c", value: new THREE.Color(0xffffff)},
          offset:      { type: "f", value: 33 },
          exponent:    { type: "f", value: 0.6 }
        }
        var skyGeo = new THREE.SphereGeometry(300, 15, 32);
        var skyMat = new THREE.ShaderMaterial({
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
          uniforms: uniforms,
          side: THREE.BackSide
        });
        var sky = new THREE.Mesh(skyGeo, skyMat);
        scene.add(sky);
      }

      function showAxes(length) {
        var axes = new THREE.Object3D();
        axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(length, 0, 0), 0xFF0000, false)); // +X Red
        axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(-length, 0, 0), 0xFF0000, true)); // -X
        axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, length, 0), 0x00FF00, false)); // +Y Green
        axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -length, 0), 0x00FF00, true)); // -Y
        axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, length), 0x0000FF, false)); // +Z Blue
        axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -length), 0x0000FF, true)); // -Z
        scene.add(axes);
      }

      function buildAxis( src, dst, colorHex, dashed) {
        var geom = new THREE.Geometry(), mat;
        if(dashed) {
          mat = new THREE.LineDashedMaterial({linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3});
        } else {
          mat = new THREE.LineBasicMaterial({linewidth: 3, color: colorHex});
        }

        geom.vertices.push( src.clone() );
        geom.vertices.push( dst.clone() );
        geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

        var axis = new THREE.LineSegments(geom, mat);
        return axis;
      }

      function showPerson3D() {
        var v = videoGroup.mVideos[1];

        setInterval(function(){
          var colorsP = [];
          var materialP = new THREE.PointsMaterial({
            size: 10, alphaTest: 0.5, transparent: true, vertexColors: THREE.VertexColors});
          var pp = scene.getObjectByName('p');
          if (pp)
            scene.remove(pp);
          var pGroup = new THREE.Object3D();
          var geometryP = new THREE.BoxGeometry(5, 20, 5);

          var fid = Math.round(v.player.currentTime() * v.opt.fps);

          var sdata = [];
          if (v._showAns) {
            for (var i in v.allScript.data[fid]) {
              if (v.allScript.data[fid][i][4] != -1 && v._trackFilter[v.allScript.data[fid][i][4][4]])
                sdata.push(v.allScript.data[fid][i]);
            }
          } else {
            sdata = v.allScript.data[fid];
          }

          for (var oi in sdata) {
            // sdata[oi][4]: Track Data
            // sdata[oi][4][0]: x1,
            // sdata[oi][4][1]: y1,
            // sdata[oi][4][3]: h,
            // sdata[oi][4][4]: track_id
            // sdata[oi][4][5]: Object Type, PERSON = 1

            // sdata[oi][0]: Action Data, 01 string with length 5:
            // 'WLK', 'STD', 'SIT', 'PICK', 'THRW'
            // sdata[oi][0][0] == '1' means walking,

            var p;
            if (sdata[oi][4] != -1 && sdata[oi][4][5] == 1) {
              var x1 = sdata[oi][4][0];
              var y2 = sdata[oi][4][1] + sdata[oi][4][3];

              var materialP = new THREE.MeshBasicMaterial();
              p = get3Dpos(x1, y2);
              var tid = sdata[oi][4][4];
              if (!videoGroup.color_tid[tid])
                videoGroup.color_tid[tid] = 'rgb('+
                  Math.floor(Math.random()*256)+','+
                  Math.floor(Math.random()*256)+','+
                  Math.floor(Math.random()*256)+')';

              // Draw an animated mesh.
              var action_name = 'DEFAULT';  // default is walking.
              if (sdata[oi][0] != -1) {
                if (sdata[oi][0][1] == 1) {
                  action_name == 'BEHAVIOR_STANDING';
                } else if (sdata[oi][0][2] == 1) {
                  action_name == 'BEHAVIOR_SITTING';
                } else if (sdata[oi][0][4] == 1) {
                  action_name == 'ACTION_THROWING';
                }
              }
              animFrameId = fid % anims['OBJ_PERSON'][action_name].frames.length;

              var animFigure = new THREE.Mesh(
                anims['OBJ_PERSON'][action_name].frames[animFrameId], materialP);
              animFigure.material.color.setStyle(videoGroup.color_tid[tid]);
              animFigure.position.x = p[0]*10+50;
              animFigure.position.y = 1;
              animFigure.position.z = -p[1]*10;
              animFigure.scale.set(5,5,5);

              pGroup.add(animFigure);

              // Draw a cylinder.
              // var obj = new THREE.Mesh(geometryP, materialP);
              // // Switch Y and Z. Y for height, -Z for depth.
              // obj.position.x = p[0]*10+50;
              // obj.position.y = 0;
              // obj.position.z = -p[1]*10;
              // obj.material.color.setStyle(videoGroup.color_tid[tid]);
              // pGroup.add(obj);
            }

            var pD = sdata[oi][5];
            if (pD != -1 && sdata[pD[0]] && sdata[pD[0]][4][5] == 1) {
              var lineMat = new THREE.LineBasicMaterial({ color: 'red' });
              var lineGeo = new THREE.Geometry();
              var pos2 = sdata[pD[0]][4];
              var p2 = get3Dpos(pos2[0], pos2[1]+pos2[3]);
              lineGeo.vertices.push(new THREE.Vector3(p[0]*10+50, 5, -p[1]*10));
              lineGeo.vertices.push(new THREE.Vector3(p2[0]*10+50, 5, -p2[1]*10));
              var line = new THREE.Line(lineGeo, lineMat);
              pGroup.add(line);
            }
          }

          pGroup.name = 'p';
          scene.add(pGroup);
        }, 80);
      }

      function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }

      function onDocumentMouseMove(event) {
        mouseX = event.clientX - windowHalfX;
        mouseY = event.clientY - windowHalfY;
      }


      function animate() {
        requestAnimationFrame(animate);
        controls.update();
        render();
      }

      function render() {
        // var time = Date.now() * 0.00005;
        // camera.position.x += (mouseX - camera.position.x) * 0.02;
        // // console.log(camera.position, camera.rotation);
        // // camera.position.y += (-mouseY - camera.position.y) * 0.02;
        // camera.lookAt(scene.position);
        renderer.render(scene, camera);
      }
  }

  // if (!$('#vis-3d').html()) {
  //   $.getJSON('/static/data/points.json', function(data){
  //     render3D(data);
  //     $('#3d-loading').hide();
  //   });
  // }

  // vis3d ====================================================================
  if ($('#vis-3d-new')) {
    console.log('Height of #video-1-show-bbox-svg', $('#video-1-show-bbox-svg').height());
    $.getJSON("/static/data/v3d.config.json", function(confs) {
      var conf = confs[socMetadata['soc_id']];
      var svgs = {};
      for (var i = 0; i < vs.length; ++i) {
          svgs[vs[i].shortViewId] = $('#' + vs[i].container + '-show-bbox-svg');
      }
      mv3d = new MSEEVis3D({
        v3dDiv: $("#vis-3d-new"),
        bboxSvgs: svgs,
        attrPoolDiv: $("#vis-attr"),
      }, conf);
      setInterval(function(){
        var t = (videoGroup.getGlobalTime() - videoGroup.startTime)/1000.0;
        mv3d.renderT(t);
      }, 100);
    });
  }

  function initInteractionAera(){
    if (!$('.video-anno').html()) {

      $('#select-view-dropdown-ul').on('click', 'a', function(){

        var e = $(this).attr('data-view');
        var opt = {
          videoUrl: socMetadata['views'][e].url,
          videoWidth: socMetadata['views'][e].width,
          videoHeight: socMetadata['views'][e].height,
          fps: socMetadata['views'][e].fps,
          keepRatio: true,
        };

        var vaID = 'video-anno-' + Math.round(Math.random()*100000);
        $('.video-anno').attr('id', vaID);
        p = new MSEEVideo(vaID, opt);


        p.setBboxFunc(function(c) {
          $('#anno-x1').val(Math.round(c.x));
          $('#anno-y1').val(Math.round(c.y));
          $('#anno-w').val(Math.round(c.w));
          $('#anno-h').val(Math.round(c.h));
        });
        p.setPointFunc(function(e){
          var x = Math.round(e.offsetX * p.opt.videoWidth / p.width);
          var y = Math.round(e.offsetY * p.opt.videoHeight / p.height);
          $('#anno-x').val(x);
          $('#anno-y').val(y);
        });

        $("#select-view-dropdown-span").html(e);
        $('#anno-type-bbox-label').trigger('click');
      });

      for (var e in socMetadata['views']) {
        $('#select-view-dropdown-ul').append(
          $('<li>').append(
            $('<a>', {
              href: '#',
              'data-view': e,
            }).html(e)
          )
        );
      }

      var videoID = Object.keys(socMetadata['views'])[0];
      var opt = {
        videoUrl: socMetadata['views'][e].url,
        videoWidth: socMetadata['views'][e].width,
        videoHeight: socMetadata['views'][e].height,
        fps: socMetadata['views'][e].fps,
        keepRatio: true,
      };

      $('#select-view-dropdown-span').html(e);

      var vaID = 'video-anno-' + Math.round(Math.random()*100000);
      $('.video-anno').attr('id', vaID);

      var p = new MSEEVideo(vaID, opt);
      p.setBboxFunc(function(c) {
        $('#anno-x1').val(Math.round(c.x));
        $('#anno-y1').val(Math.round(c.y));
        $('#anno-w').val(Math.round(c.w));
        $('#anno-h').val(Math.round(c.h));
      });
      p.setPointFunc(function(e){
        var x = Math.round(e.offsetX * p.opt.videoWidth / p.width);
        var y = Math.round(e.offsetY * p.opt.videoHeight / p.height);
        $('#anno-x').val(x);
        $('#anno-y').val(y);
      });

      setInterval(function(){
        $('#anno-fn').val(Math.round(p.player.currentTime() * opt.fps));
      }, 20);

      // $('#q-rel').hide();
      $('#anno-type-radios input').change(function(){
        var annoType = $(this).attr('data-at');
        $('#anno-type-radios').attr('data-otype', $(this).attr('data-at'));

        $('#anno-bbox').hide();
        $('#anno-point').hide();
        if (annoType == 'empty'){
          $('.video-anno').find('.msee-video-annotation-bbox-container').hide();
          $('.video-anno').find('.msee-video-annotation-point-svg-div').hide();
          $('.video-anno').find('.msee-video-annotation-point-div').hide();
        } else if (annoType == 'bbox'){
          $('#anno-bbox').show();
          $('.video-anno').find('.msee-video-annotation-bbox-container').show();
          $('.video-anno').find('.msee-video-annotation-point-svg-div').hide();
          $('.video-anno').find('.msee-video-annotation-point-div').hide();
        } else if (annoType == 'point'){
          $('#anno-point').show();
          $('.video-anno').find('.msee-video-annotation-bbox-container').hide();
          $('.video-anno').find('.msee-video-annotation-point-svg-div').show();
          $('.video-anno').find('.msee-video-annotation-point-div').show();
        }
      });

      $('.anno-ot-a').click(function(){
        $('#anno-ot-span').html($(this).html());
      });

      $(".m-tab").hide();
      $("#create-obj-tab").show();

      $(".q-tab").hide();
      $('#query-ontology-tab').show();
    }
  }

  $('#add-obj-modal').on('show.bs.modal', function() {
    setTimeout(initInteractionAera,500);
  });

  var objMgr = new MSEEObjectManager();
  objMgr.ui.createObjectsPool('objects-pool');
  // objMgr.ui.createObjectsPool('objects-pool2');
  objMgr.ui.createObjectsDropdown('q-attr-o');
  objMgr.ui.createObjectsDropdown('q-rel-o1');
  objMgr.ui.createObjectsDropdown('q-rel-o2');
  $("#object-create-btn").click(function(){
    var oname = $("#anno-name").val();
    var otype = $("#anno-type-radios").attr('data-otype');
    var oconf = {};
    // oconf.socID = $('#socid-span').attr('data-socid');
    oconf.socID = socMetadata['soc_id'];
    oconf.videoID = $('#select-view-dropdown-span').html();
    oconf.frameID = $("#anno-fn").val();
    if (otype == 'point') {
      oconf.x = $("#anno-x").val();
      oconf.y = $("#anno-y").val();
    }
    if (otype == 'bbox') {
      oconf.x1 = $("#anno-x1").val();
      oconf.y1 = $("#anno-y1").val();
      oconf.w = $("#anno-w").val();
      oconf.h = $("#anno-h").val();
    }
    oconf.objType = $("#anno-ot-span").html();
    var obj = new MSEEObject(otype, oname, oconf);
    var res = objMgr.addObject(obj);
    if (!res) {
      $('#oname-input-group').addClass('has-error');
    } else {
      $('#oname-input-group').removeClass('has-error');
      $("#anno-name").val('');
    }

    insts.push({'name': oname, 'object': $("#anno-ot-span").html()});

    $.ajax({
      'type': 'POST',
      'url': '/api/questions2/',
      'contentType': '/application/json',
      'data': JSON.stringify(insts),
      'dataType': 'json',
      'success': function(res) {
        oAttr = res['attribute'];
        oRel = res['relationship'];
      }
    });
  });

  var oAttr, oRel;
  $("#q-attr-o").on('click', '.msee-objects-dropdown-a', function(){
    var ot = objMgr.objects[$(this).attr('data-oname')].objType;
    $('#q-attr .list-group').html('');

    // Append a special attribute for existence question.
    $('#q-attr .list-group').append(
        $('<a>', {
          class: 'list-group-item',
          href: '#',
        }).html('Exist')
      );

    for (var i = 0; i < oAttr[ot].length; ++i)
      $('#q-attr .list-group').append(
        $('<a>', {
          class: 'list-group-item',
          href: '#',
        }).html(oAttr[ot][i])
      );
  });

  $(".q-rel-o").on('click', '.msee-objects-dropdown-a', function(){
    var on1 = $('#q-rel-o1-objects-dropdown-dsp-span').attr('data-oname');
    var on2 = $('#q-rel-o2-objects-dropdown-dsp-span').attr('data-oname');
    if (on1 && on2) {
      var ot = objMgr.objects[on1].objType+' '+objMgr.objects[on2].objType;
      $('#q-rel .list-group').html('');
      for (var i = 0; i < oRel[ot].length; ++i)
        $('#q-rel .list-group').append(
          $('<a>', {
            class: 'list-group-item',
            href: '#',
          }).html(oRel[ot][i])
        );
    }
  });

  $('#query-test-submit').click(function(){
    $.post('/api/query2/', {
      // 'soc_id': $('#socid-span').attr('data-socid'),
      'soc_id': socMetadata['soc_id'],
      'storyline': 'sl_id',
      'xml': $('#query-test-xml').html(),
    }).done(function(res){
      $('#query-test-res').html(res);
    });
  });

  var insts = [];
  $('#q-rel').hide();
  $('#q-type-radios input').change(function(){
    $('.q-info').hide();
    $('#'+$(this).attr('data-q')).show();
  });

  var query = new MSEEQuery(
    // $('#socid-span').attr('data-socid'),
    socMetadata['soc_id'],
    storylineID
  );

  var pgGraphRender = new ParseGraphRender("#canvas-pg", 590, 370, 12);
  function renderExplanationGraph(explanation) {
      var pgStr = explanation.parsegraph.replace(/\\/g, "");
      var highlights = explanation.highlights;
      var jp = dot2json(pgStr);

      pgGraphRender.clear();
      pgGraphRender.drawGraph(jp.root);
      // pgGraphGlobal.highlight(highlights);

      if (explanation.mainnodes){
        pgGraphRender.highlightNode(explanation.mainnodes)
      }
      if (explanation.mainedges){
        pgGraphRender.highlightEdge(explanation.mainedges)
      }
  }

  function appendQuestion(q) {
    $('#history-pool').append(
      $('<div>', {
        class: 'history-entry history-entry-q'
      }).html('Q: '+q).hide().fadeIn('slow')
    );
    scrollHistory();
  }

  function appendAnswer(a, isError) {
    const entryClass = isError ? 'history-entry-e' : 'history-entry-a';

    $('#history-pool').append(
      $('<div>', {
        class: 'history-entry ' + entryClass
      }).html('A: '+ a).hide().fadeIn('slow')
    );
    scrollHistory();
  }

  function appendAnswer2(d) {
    $('#history-pool').append(
      $('<div>', {
        class: 'history-entry history-entry-a'
      }).append(d).hide().fadeIn('slow')
    );
    scrollHistory();
  }

  function scrollHistory(){
    $('#history-pool').animate({
        scrollTop: $('#history-pool')[0].scrollHeight}, 2000);
  }

  function updatePreview() {
    $('#q-preview').html(query.ui.getQueryDisplay());
  }

  $('#q-preview').on("mouseenter", '.msee-query-predicate-span', function(){
    $(this).children('.msee-query-predicate-del').show();
  });

  $('#q-preview').on("mouseleave", '.msee-query-predicate-span', function(){
    $(this).children('.msee-query-predicate-del').hide();
  });

  $('#q-preview').on("click", '.msee-query-predicate-del', function(){
    query.delPredicateGroup($(this).attr('data-pi'));
    updatePreview();
  });

  $('#q-attr').on('click', '.list-group-item', function() {
    var objn = $('#q-attr #q-attr-o-objects-dropdown-dsp-span').attr('data-oname');
    var attr = $(this).html();
    var info = {};
    info.time = queryTimeRange.getTimeRange();
    query.addAttrPredicates(objMgr.objects[objn], attr, info);
    updatePreview();
    console.log(query.getQuery());
  });

  $('#q-rel').on('click', '.list-group-item', function() {
    var objn1 = $('#q-rel-o1-objects-dropdown-dsp-span').attr('data-oname');
    var objn2 = $('#q-rel-o2-objects-dropdown-dsp-span').attr('data-oname');
    var rel = $(this).html();
    var info = {};
    info.time = queryTimeRange.getTimeRange();
    query.addRelPredicates(objMgr.objects[objn1], objMgr.objects[objn2], rel, info);
    updatePreview();
    console.log(query.getQuery());
  });

  $('#q-clear').click(function(){
    query.clear();
    $('#q-preview').html('&nbsp;');
  });

  $('#query-type-non-polar').click(function(){
    $('#query-type-span').html('Non-polar');
    $('#query-type-span').attr('data-qtype', 'non-polar');
  });

  $('#query-type-polar').click(function(){
    $('#query-type-span').html('Polar');
    $('#query-type-span').attr('data-qtype', 'polar');
  });

  // Formal language query submit.
  $('#q-submit-btn').click(function(){
    query.setPolar($("#query-type-span").attr('data-qtype') == 'polar');

    if(query.empty()){
      return;
    }

    var queryRequest = JSON.stringify(query.getQuery(), null, 2);
    submitQuery(queryRequest);
    for (var i = 0; i < query.ontEdges.length; ++i) {
      var e = query.ontEdges[i];
      if (e.length == 2) {
        ontologyCanvas.highlightNode(['#node-'+e[0], '#node-'+e[0]+'-'+e[1]]);
        ontologyCanvas.highlightLink(['#link-'+e[0]+'-'+e[1]])
      } else if (e.length == 3) {
        var rid = e[0]+'-'+e[2]+'-'+e[1];
        ontologyCanvas.highlightNode(['#node-'+e[0], '#node-'+e[1], '#node-'+rid]);
        ontologyCanvas.highlightLink(['#link-'+rid+'-1', '#link-'+rid+'-2']);
      }
    }

    appendQuestion($('#q-preview').html());
    $('#q-preview').html('&nbsp;');
    query.clear();
  });

  var ontologyCanvas = new MSEEOntologyGraph('#canvas-ontology', 730, 450);
  ontologyCanvas.drawGraph(ontologyGraph);

  var queryGraphCanvas = new MSEEOntologyGraph('#canvas-query-graph', 420, 250);
  var returnedGraphs = null;
  var queryGraphs = null;
  var ansDetail = [];

    /* This function submits query to MSEE query API.
     * Input:
     *     queryRequest shall be the JSON string to be posted.
     */
  function submitQuery(queryRequest){
    // Update debug tab.
    $('#query-test-request').text(queryRequest);
    $('#query-test-err').html('None');

    // $.post('http://128.97.86.189:8001/api/query/', queryRequest, null, "json").done(function(res){
    $.post('/api/query/', queryRequest, null, "json").done(function(res){
      console.log('Query API response: \n', res);

      // Update history.
      if (res.explanation){
        var display_text = res.explanation.text.replace(/\\n/g, '<br>')
          .replace(/\[|\]/g, '').replace(/:/g, ': ')
          .replace(/Question/g, '<b>Question')
          .replace(/, Explanation/g, '<br><b>Explanation')
          .replace(/Type/g, 'Type</b>');

        appendAnswer(display_text);
        renderExplanationGraph(res.explanation);
        videoGroup.playRange(
              new Date(res.answerDetails[0].startTime),
              new Date(res.answerDetails[0].endTime));
        videoGroup.ui.displayTimeRange('main-vc',
              new Date(res.answerDetails[0].startTime),
              new Date(res.answerDetails[0].endTime));
        $('#history-pool .history-entry-q').last().addClass('history-entry-q-exp');
        $('#history-pool .history-entry-a').last().addClass('history-entry-a-exp');
      }
      else{
        appendAnswer(res.answer + ' (' + res.timeEscaped + ' seconds)');
      }
      // res.explanation = {"parsegraph": "digraph G { person11[label=\"person1\", shape=\"oval\", action=\"sitting\", cloth_style=\"half_sleeve\", glass=\"no\", hat=\"no\", hair_style=\"short\", gender=\"male\",age=\"30\",alpha=0.4,beta=0.6,gamma=0.2] full_body11[label=\"full body\", shape = \"oval\", action=\"sitting\", cloth_style=\"half_sleeve\", glass=\"no\", hat=\"no\", hair_style=\"short\", gender=\"male\",age=\"30\",alpha=0.4,beta=0.42,gamma=0.1]  upper_body11[label=\"upper body\", shape = \"oval\", action=\"standing\", cloth_style=\"half_sleeve\", glass=\"no\", hat=\"no\", hair_style=\"short\", gender=\"male\",age=\"30\",alpha=0.8,beta=0.5,gamma=0.2]  lower_body11[label=\"lower body\", shape = \"oval\", action=\"\", cloth_style=\"\", glass=\"\", hat=\"\", hair_style=\"\", gender=\"\",age=\"\",alpha=0,beta=0,gamma=0.32] person11 -> full_body11; full_body11 -> upper_body11; full_body11 -> lower_body11 }",
          // highlights: ["person11", "full_body11", "upper_body11", "lower_body11"]};

      // Update graph visualization.
      returnedGraphs = res.answerParseGraph.graphs;
      ansDetail = res.answerDetails;
      $('#select-graph-dropdown-ul li').remove();
      var num_graphs = returnedGraphs.length;
      $('#select-graph-count-span').html(num_graphs);
      for (var graph_idx = 0; graph_idx < num_graphs; graph_idx++) {
        $('#select-graph-dropdown-ul').append(
          $('<li>').append(
            $('<a>', {
              href: '#',
              'data-graph-id': graph_idx,
            }).html(graph_idx + 1)
          )
        );
      }

      if (num_graphs > 0) {
        var sgd = $('<p>');
         for (var graph_idx = 0; graph_idx < num_graphs; graph_idx++) {
          sgd.append(
            $('<span>', {
              class: 'label label-primary select-graph-span',
              'data-graph-id': graph_idx,
            }).html(graph_idx + 1)
          );
        }
        // appendAnswer2(sgd);
        // Show the first graph by default.
        ansGraphIdx = 0;
        showAnsGraph();
      }

      queryGraphs = res.queryGraph.graphs;
      queryGraphCanvas.clear();
      if (queryGraphs.length > 0){
        queryGraphCanvas.drawGraph(queryGraphs[0]);
      }

      // Update debug tab.
      $('#query-test-translated').text(formatXml(res.translatedXML));
      console.log('Translated XML:\n', formatXml(res.translatedXML));
      $('#query-test-res').html(returnedGraphs.length);
      $('#query-test-details').text(JSON.stringify(res.answerDetails, null, 2));
      if (res.error){
        $('#query-test-err').html(res.error);
      }

    }).fail(function( jqXHR, textStatus, errorThrown ){
      if (jqXHR.responseJSON && jqXHR.responseJSON.error){
        // Error from Query API.
        appendAnswer(jqXHR.responseJSON.error, true);
        $('#query-test-res').html(jqXHR.responseJSON.error);
        $('#query-test-translated').html(jqXHR.responseJSON.translatedXML);
      }
      else{
        appendAnswer(jqXHR.status + ': ' + jqXHR.responseText, true);
        $('#query-test-res').html('');
        $('#query-test-translated').html('');
      }
      $('#query-test-details').html('');
    });
  }

  // Natural language query submit.
  $('#q-nl-submit-btn').click(function(){
    var nlQuery = $('#q-nl-input').val();
    if(nlQuery.length == 0){
      return;
    }

    var queryRequest = JSON.stringify(query.getNaturalLanguageQuery(nlQuery, trMgr.timeRanges, objMgr.objects), null, 2);
    appendQuestion(nlQuery);
    submitQuery(queryRequest);
    console.log('Request to query API: \n', queryRequest);

    $('#q-nl-input').val('');
    query.clear();
  });

  $('#q-nl-input').keypress(function(e) {
    if (e.which == 13) {
      $('#q-nl-submit-btn').trigger('click');
    }
  });

  var pgCanvas = new MSEEParseGraph('#canvas-pg', 590, 410);
  var ansGraphIdx = 0;
  // Graph visualization switch
  function showAnsGraph() {
    // var graph_idx = parseInt($('#select-graph-dropdown-ul').attr('data-gid'));
    var graph_idx = ansGraphIdx;
    if (returnedGraphs && graph_idx < returnedGraphs.length){
      $("#select-graph-dropdown-span").html('Showing result ' + (graph_idx + 1));
      pgCanvas.clear();
      pgCanvas.drawGraph(returnedGraphs[graph_idx]);
      videoGroup.showAns(ansDetail[graph_idx]);
      videoGroup.ui.displayTimeRange('main-vc',
        new Date(ansDetail[graph_idx]['startTime']),
        new Date(ansDetail[graph_idx]['endTime']));
      var st = new Date(ansDetail[graph_idx]['startTime']);
      var et = new Date(ansDetail[graph_idx]['endTime']);
      console.log(st, et);
    }
  }

  // $('#select-graph-dropdown-ul').on('click', 'a', function(){
  //   $('#select-graph-dropdown-ul').attr('data-gid', $(this).attr('data-graph-id'));
  //   $('#graph-showall').removeClass('active');
  //   $('#graph-showans').addClass('active');
  //   showAnsGraph();
  // });

  $('#history-pool').on('click', '.select-graph-span', function(){
    ansGraphIdx = parseInt($(this).attr('data-graph-id'));
    $('#graph-showall').removeClass('active');
    $('#graph-showans').addClass('active');
    showAnsGraph();
  });

  $('#graph-showans').click(function(){
    showAnsGraph();
  });

  $('#graph-showall').click(function(){
    videoGroup.ui.hideTimeRange('main-vc');
    videoGroup.showAll();
  });

  $('#vis-answer-tab').hide();

  $('.vis-tab-a').click(function() {
    $('.v-tab').hide();
    $('#'+$(this).attr('data-tab')).show();
  });

  // 3D Reconstruction/Ontology tabs
  $('#vis2-ont-tab').hide();
  $('#vis2-aog-tab').hide();

  $('.vis2-tab-a').click(function() {
    $('.v2-tab').hide();
    $('#'+$(this).attr('data-tab')).show();
  });

  // Query/answer graph tabs
  $('#qagraph-answer-tab').hide();

  $('.qagraph-tab-a').click(function() {
    $('.qagraph-tab').hide();
    $('#'+$(this).attr('data-tab')).show();
  });

  //TODO change the following function to a class
  // renderParseGraph();
    // var explanation = {
    //     "parsegraph": "digraph G{ lower_body21 [ gamma_normalized=\"1.0\", personid=\"15\", alpha_normalized=\"0.0\", beta=\"0\", frameid=\"1430\", shape=\"oval\", alpha=\"0\", beta_normalized=\"0.0\", label=\"lower body\", gamma=\"0.32\" ]   full_body21 [ gamma_normalized=\"0.11\", personid=\"15\", gender=\"male\", age=\"30\", alpha_normalized=\"0.43\", beta=\"0.42\", frameid=\"1430\", glass=\"no\", shape=\"oval\", hair_style=\"short\", cloth_style=\"half_sleeve\", alpha=\"0.4\", action=\"sitting/standing/walking\", beta_normalized=\"0.46\", label=\"full body\", hat=\"no\", gamma=\"0.1\" ]   right_leg21 [ gamma_normalized=\"1.0\", personid=\"15\", alpha_normalized=\"0.0\", beta=\"0\", frameid=\"1430\", shape=\"oval\", alpha=\"0\", beta_normalized=\"0.0\", label=\"right leg\", gamma=\"0.18\" ]   left_leg21 [ gamma_normalized=\"1.0\", personid=\"15\", alpha_normalized=\"0.0\", beta=\"0\", frameid=\"1430\", shape=\"oval\", alpha=\"0\", beta_normalized=\"0.0\", label=\"left leg\", gamma=\"0.2\" ]  lower_body21->right_leg21;lower_body21->left_leg21;full_body21->lower_body21;}",
    //     "highlights": ["lower_body21", "full_body21", "right_leg21", "left_leg21"]
    // };
    // renderExplanationGraph(explanation);
});
