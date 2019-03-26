function MSEEVis3D(containers, conf) {
  /*
    conf:
    {
      "cam": {
        // see "https://threejs.org/docs/api/cameras/PerspectiveCamera.html"
        "fov": 55,
        "aspect": ,  // default: w/h
        "near": 2,
        "far": 1000000,
        "x": 40,
        "y": 60,
        "z": 65,
      },
      "fps": 29.97,
      "poseSrc": "/static/data/pose.json",
      "boneRadius": 0.3,
      "poseBones": [
        [0, 1],
        [1, 2], [1, 5],
        [2, 3], [3, 4], [5, 6], [6, 7],
        [2, 8], [8, 9], [9, 10], [5, 11], [11, 12], [12, 13]
      ],
      "pointCloudSrc": "/static/data/points.json",
      "pointSize": 2,  // default: 2
    }
  */
  var _self = this

  _self.conf = conf
  _self.container = containers.v3dDiv
  _self.svgs = containers.bboxSvgs
  _self.attrP = containers.attrPoolDiv
  _self.cw = _self.container.width()
  _self.ch = _self.container.height()
  _self.bgPoints = []
  _self.curFi = 0
  _self.lastFi = -1
  _self.rect = {}

  if (!_self.conf.boneRadius)
    _self.conf.boneRadius = 0.3
  if (!_self.conf.vcone)
    _self.conf.vcone = {'r': 2, 'h': 8}

  _self.init = function() {
    _self.cam = new THREE.PerspectiveCamera(
      _self.conf.cam.fov,
      _self.conf.cam.aspect || _self.cw/_self.ch,
      _self.conf.cam.near,
      _self.conf.cam.far
    )
    _self.cam.position.x = _self.conf.cam.x
    _self.cam.position.y = _self.conf.cam.y
    _self.cam.position.z = _self.conf.cam.z

    _self.scene = new THREE.Scene()

    _self.renderer = new THREE.WebGLRenderer()
    _self.renderer.setPixelRatio(window.devicePixelRatio)
    _self.renderer.setSize(_self.cw, _self.ch)
    _self.renderer.setClearColor(0xffffff)
    _self.container.append(_self.renderer.domElement)

    _self.controls = new THREE.OrbitControls(
      _self.cam, _self.renderer.domElement)
    _self.render()
    _self.controls.addEventListener('change', _self.render)
  }

  _self.render = function() {
    _self.renderer.render(_self.scene, _self.cam)
  }

  _self.addBackground = function() {
    var geo = new THREE.Geometry()
    for (var i = 0; i < _self.bgPoints.length; ++i) {
      geo.vertices.push(new THREE.Vector3(
        _self.bgPoints[i][0],
        _self.bgPoints[i][1],
        _self.bgPoints[i][2]))
      geo.colors.push(new THREE.Color(
        'rgb('+_self.bgPoints[i][3]+','
        +_self.bgPoints[i][4]+','
        +_self.bgPoints[i][5]+')'
      ))
    }
    var material = new THREE.PointsMaterial({
      size: _self.conf.pointSize || 2,
      alphaTest: 0.5,
      transparent: true,
      vertexColors: THREE.VertexColors
    })
    _self.scene.add(new THREE.Points(geo, material))
    // var axisHelper = new THREE.AxisHelper(5)
    // _self.scene.add(axisHelper)
    _self.render()
  }

  _self._getbone = function(p1, p2, mbm, tid) {
    var bonel = p1.distanceTo(p2), geom
    if (tid < 1000) {
      geom = new THREE.CylinderGeometry(
        _self.conf.boneRadius, _self.conf.boneRadius, bonel, 4)
    } else {
      geom = new THREE.CylinderGeometry(
        0.15, 0.15, bonel, 4)
    }
    var v = new THREE.Vector3()
    v.subVectors(p2, p1).normalize()
    var quaternion = new THREE.Quaternion()
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v)
    geom.applyMatrix(
      new THREE.Matrix4().makeTranslation(0, bonel/2, 0))
    geom.applyMatrix(
      new THREE.Matrix4().makeRotationFromQuaternion(quaternion))
    geom.applyMatrix(new THREE.Matrix4().makeTranslation(p1.x, p1.y, p1.z))
    return (new THREE.Mesh(geom, mbm))
  }

  _self._getGazeCone = function(eye, dir, mbm) {
    var geom = new THREE.CylinderGeometry(
      _self.conf.vcone.r, 0, _self.conf.vcone.h
    )
    var quaternion = new THREE.Quaternion()
    quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(dir[0], dir[1], dir[2]).normalize())
    geom.applyMatrix(
      new THREE.Matrix4().makeTranslation(0, _self.conf.vcone.h/2, 0))
    geom.applyMatrix(
      new THREE.Matrix4().makeRotationFromQuaternion(quaternion))
    geom.applyMatrix(new THREE.Matrix4().makeTranslation(eye[0], eye[1], eye[2]))

    var mesh = new THREE.Mesh(geom, mbm)
    return mesh
  }

  _self._addPose = function(joints, color, tid) {
    var mbm = new THREE.MeshBasicMaterial({color: color})
    // var mbm_pred = new THREE.MeshBasicMaterial({color: '#000'})
    // var mbm2 = new THREE.MeshBasicMaterial({color: '#F00'})
    for (var i = 0; i < _self.conf.poseBones.length; ++i) {
      var x = _self.conf.poseBones[i][0], y = _self.conf.poseBones[i][1]
      var p1 = new THREE.Vector3(joints[x][0], joints[x][1], joints[x][2])
      var p2 = new THREE.Vector3(joints[y][0], joints[y][1], joints[y][2])
      // if (!_self.conf.poseBones[i][2])
      // if (tid < 1000 && (i == 6 || i == 7))  // Pred
      _self.poseGroup.push(_self._getbone(p1, p2, mbm, tid))
      // else
      //   _self.poseGroup.push(_self._getbone(p1, p2, mbm, tid))
    }
    // _self.poseGroup.push(_self._getGazeCone(joints[15], joints[32], mbm))
  }

  _self._cleanPose = function() {
    for (var i = 0; i < _self.poseGroup.length; ++i) {
      _self.poseGroup[i].geometry.dispose()
      _self.poseGroup[i].material.dispose()
      _self.scene.remove(_self.poseGroup[i])
      delete(_self.poseGroup[i])
    }
  }

  _self._cleanObj = function() {
    for (var i = 0; i < _self.objGroup.length; ++i) {
      _self.objGroup[i].geometry.dispose()
      _self.objGroup[i].material.dispose()
      _self.scene.remove(_self.objGroup[i])
      delete(_self.objGroup[i])
    }
  }

  _self.updateBBox = function(fi, ti, v) {
    if (!_self.bbox || !_self.bbox[v] || !_self.bbox[v][fi] || !_self.bbox[v][fi][ti] || !_self.act)
      return
    if (!_self.act[fi][ti])
      _self.act[fi][ti] = ""
    _self.svgs[v] = $(_self.svgs[v].selector)
    var svg_h = _self.svgs[v].height()
    var x = _self.bbox[v][fi][ti][0]*svg_h/1080,
      y = _self.bbox[v][fi][ti][1]*svg_h/1080,
      c = '#'+(_self.pcolor[ti]+0x1000000).toString(16).substr(-6)
    if (_self.bbox[v][fi] && _self.bbox[v][fi][ti]) {
      if (_self.svgs[v]) {
        _self.svgs[v].append(
          $('<rect>',{
            x: x,
            y: y,
            width: _self.bbox[v][fi][ti][2]*svg_h/1080,
            height: _self.bbox[v][fi][ti][3]*svg_h/1080,
            stroke: c,
            'fill-opacity': 0,
          })
        ).append(
          $('<rect>',{
            x: x-0.5,
            y: y-10,
            width: _self.act[fi][ti].length*5,
            height: 10,
            fill: c,
          })
        ).append(
          $('<text>', {
            x: x+1,
            y: y-2,
            fill: '#fff',
          }).html(_self.act[fi][ti])
        )
      }
    }
  }

  _self.renderPoses = function() {
    if (!_self.pose)
      return
    fi = _self.curFi

    _self._cleanPose()
    _self.poseGroup = []
    for (v in _self.svgs) {
      if (_self.svgs[v]) {
        _self.svgs[v].html('')
      }
    }
    if (_self.attrP)
      _self.attrP.html('')
    for (var ti in _self.pose[fi]) {
      if (!_self.pcolor[ti%1000])
        // _self.pcolor[ti%1000] = Math.floor(Math.random()*0xffffff)
        _self.pcolor[ti%1000] = 256 * 256 * (128 + Math.floor(Math.random()*0x7f))
                                + 256 * (128 + Math.floor(Math.random()*0x7f))
                                + (128 + Math.floor(Math.random()*0x7f))
      _self._addPose(
        _self.pose[fi][ti],
        _self.pcolor[ti%1000],
        ti
      )
      for (v in _self.svgs) {
        _self.updateBBox(fi, ti, v)
      }
      if (_self.attr && _self.attr[ti]) {
        if (_self.attrP) {
          var c = '#'+(_self.pcolor[ti]+0x1000000).toString(16).substr(-6)
          _self.attrP.append(
            $('<div>', {
              class: 'attr-lbl'
            }).html((ti -100) +' '+_self.attr[ti]).css('background-color', c) //.css('color', '#fff')
          )
        }
      }
    }
    for (var i = 0; i < _self.poseGroup.length; ++i)
      _self.scene.add(_self.poseGroup[i])
    _self.render()
    for (v in _self.svgs) {
      if (_self.svgs[v])
        _self.svgs[v].html(_self.svgs[v].html())
    }
  }

  _self.renderObjs = function() {
    if (!_self.obj)
      return
    fi = _self.curFi

    _self._cleanObj()
    _self.objGroup = []
    for (var ti in _self.obj[fi]) {
      if (!_self.ocolor[ti])
        _self.ocolor[ti] = Math.floor(Math.random()*0xffffff)
      boxMesh = new THREE.Mesh(
        new THREE.BoxGeometry(
          _self.obj[fi][ti][1][0],
          _self.obj[fi][ti][1][1],
          _self.obj[fi][ti][1][2]
        ),
        new THREE.MeshBasicMaterial({color: _self.ocolor[ti]})
      )
      boxMesh.position.set(
        _self.obj[fi][ti][0][0],
        _self.obj[fi][ti][0][1],
        _self.obj[fi][ti][0][2]
      )
      if (_self.obj[fi][ti].length > 2) {
        boxMesh.rotation.set(
          _self.obj[fi][ti][2][0],
          _self.obj[fi][ti][2][1],
          _self.obj[fi][ti][2][2]
        )
      }
      _self.objGroup.push(boxMesh)
    }
    for (var i = 0; i < _self.objGroup.length; ++i)
      _self.scene.add(_self.objGroup[i])
    _self.render()
  }

  _self.render3dObjs = function(fi) {
    if (!_self.obj3d || !_self.obj3dMat)
      return
    if (fi > 13380)
      fi = fi + 74
    if (JSON.stringify(_self.obj3dMat[fi]) == JSON.stringify(_self.obj3dMat[_self.lastFi])) {
      return
    }
    _self.scene.remove(_self.obj3dmesh)
    var geo = new THREE.Geometry()
    for (var i = 0; i < _self.obj3d.length; ++i) {
      geo.vertices.push(new THREE.Vector3(
        _self.obj3d[i][0],
        _self.obj3d[i][1],
        _self.obj3d[i][2]))
      geo.colors.push(new THREE.Color(
        'rgb('+_self.obj3d[i][3]+','
        +_self.obj3d[i][4]+','
        +_self.obj3d[i][5]+')'
      ))
    }
    var material = new THREE.PointsMaterial({
      size: _self.conf.pointSize || 2,
      alphaTest: 0.5,
      transparent: true,
      vertexColors: THREE.VertexColors
    })
    _self.obj3dmesh = new THREE.Points(geo, material)
    _self.obj3dmesh.matrixAutoUpdate = false

    var q = new THREE.Matrix4(), p = new THREE.Matrix4()
    // q.set(
    //   -0.515038, 0.000000, -0.857167, 0.469966,
    //   -0.857167, -0.000000, 0.515038, 6.456344,
    //   0.000000, 1.100000, 0.000000, -1.485000,
    //   0, 0, 0, 0
    // )
    // console.log(q)
    q.elements = _self.obj3dMat[fi]
    p.set(
      10, 0, 0, 0,
      0, 0, 10, 0,
      0, -10, 0, 0
    )
    _self.obj3dmesh.updateMatrix()
    _self.obj3dmesh.applyMatrix(q)
    _self.obj3dmesh.updateMatrix()
    _self.obj3dmesh.applyMatrix(p)
    _self.obj3dmesh.updateMatrix()
    // console.log(_self.obj3dmesh.position)

    _self.scene.add(_self.obj3dmesh)
    _self.render()
  }

  _self.update3dObj = function(fi) {

    _self.render3dObjs(fi)
  }

  _self.renderF = function(fi) {
    if (_self.curFi != fi) {
      _self.curFi = fi
      _self.renderPoses()
      _self.renderObjs()
      _self.update3dObj(fi)
      _self.lastFi = fi
    }
  }

  _self.renderT = function(t) {
    _self.renderF(Math.round(t*_self.conf.fps))
  }

  _self.loadDataJson = function(src, f) {
    if (src) {
      $.getJSON(src, function(data) {
        console.log(data['meta'])
        f(data['data'])
      })
    }
  }


  _self.init()

  _self.loadDataJson(_self.conf.pointCloudSrc, function(data) {
    _self.bgPoints = data
    _self.addBackground()
  })

  _self.loadDataJson(_self.conf.poseSrc, function(data) {
    _self.pose = data
    _self.pcolor = {}
    _self.poseGroup = []
    _self.renderPoses()
  })

  _self.bbox = {}
  var fBbox = function(v) {
    return function(data) {
      _self.bbox[v] = data
    }
  }
  for (var v in _self.svgs) {
    _self.loadDataJson(_self.conf.bboxSrcs[v], fBbox(v))
  }

  _self.loadDataJson(_self.conf.actSrc, function(data) {
    _self.act = data
  })

  _self.loadDataJson(_self.conf.attrSrc, function(data) {
    _self.attr = data
  })

  if (_self.conf.objSrc) {
    $.getJSON(_self.conf.objSrc, function(data) {
      _self.obj = data
      _self.ocolor = {}
      _self.objGroup = []
      _self.renderObjs()
    })
  }

  if (_self.conf.obj3dMatSrc) {
    $.getJSON(_self.conf.obj3dMatSrc, function(data) {
      _self.obj3dMat = data
      _self.render3dObjs(0)
    })
  }
  if (_self.conf.obj3dSrc) {
    $.getJSON(_self.conf.obj3dSrc, function(data) {
      _self.obj3d = data
      _self.render3dObjs(0)
    })
  }
}
