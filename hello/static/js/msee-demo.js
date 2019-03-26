function _genRandomStr(n) {
  var s = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  var res = "";
  for (var i = 0; i < n; ++i)
    res += s[Math.floor(Math.random()*s.length)];
  return res;
}

function MSEEVideo(did, opt) {
  this.opt = opt;
  this.width = $('#'+did).width();
  var _self = this;

  if (opt.keepRatio)
    this.height = this.width/opt.videoWidth*opt.videoHeight;
  else
    this.height = this.width * 9 / 16;
  this.scale = this.width/opt.videoWidth;

  this._showAns = false;
  this._hidelabels = true;
  this._trackFilter = {};

  $('#'+did).html('').css(
    'height', this.height
  ).append(
    $('<div>', {class: 'msee-video-container'}).append(
      $('<div>', {class: 'msee-video-player-container'}).append(
        $('<video>', {
          id: did+'-videojs',
          class: 'video-js vjs-default-skin vjs-big-play-centered',
          controls: '',
          preload: 'auto',
        })
      )
    ).append(
      $('<div>', {
          id: did+'-annotation-bbox-container',
          class: 'msee-video-annotation-bbox-container',
      }).append(
        $('<img>', {
          id: did+'-annotation-bbox-img',
          class: 'msee-video-annotation-bbox-img',
        })
      )
    ).append(
      $('<div>', {
        id: did+'-annotation-point-div',
        class: 'msee-video-annotation-point-div',
      })
    ).append(
      $('<div>', {
        id: did+'-annotation-point-svg-div',
        class: 'msee-video-annotation-point-svg-div',
      }).append(
        $('<svg>', {
          id: did+'-annotation-point-svg',
          class: 'msee-video-annotation-point-svg',
        }).append(
          $('<rect>', {
            id: did+'-annotation-point-rect',
            class: 'msee-video-annotation-point-rect',
            x: -3,
            y: -3,
          })
        )
      )
    ).append(
      $('<div>', {
        id: did+'-show-bbox-svg-div',
        class: 'msee-video-show-bbox-svg-div',
      }).append(
        $('<svg>', {
          id: did+'-show-bbox-svg',
          class: 'msee-video-show-bbox-svg',
        })
      )
    )
  );

  $('#'+did+'-annotation-point-svg-div').html(
      $('#'+did+'-annotation-point-svg-div').html());

  this.height = $('#'+did).height();
  this._sbbox_svg_div = $('#'+did+'-show-bbox-svg-div');

  this.player = videojs(did+'-videojs');
  this.player.src(opt.videoUrl);
  this.player.bigPlayButton.show();

  this.setBboxFunc = function(f) {
    $('#'+did+'-annotation-bbox-container').show();
    $.Jcrop('#'+did+'-annotation-bbox-img', {
      trueSize: [opt.videoWidth, opt.videoHeight],
      onSelect: f,
      bgColor: 'rbga(0, 0, 0, 0)'
    });
    $('#'+did).addClass('show-control-bar-below');
  }

  this.setPointFunc = function(f) {
    $('#'+did+'-annotation-point-div').mousedown(function(e){
      $('#'+did+'-annotation-point-rect')
        .attr('x', e.offsetX-1)
        .attr('y', e.offsetY-1)
      f(e);
    });
  }

  this.loadAllScript = function() {
    if (_self.allScript)
      return;
    $.getJSON(_self.opt.allScript, function(data) {
      _self.allScript = data;
    });
  }

  this.showAns = function(ans) {
    _self._showAns = true;
    _self._trackFilter = {};
    for (var ti = 0; ti < ans.tracks.length; ++ti)
      _self._trackFilter[ans.tracks[ti].id] = ans.tracks[ti].bvar;
  }

  this.showAll = function() {
    _self._showAns = false;
    _self._trackFilter = {};
    _self._playRange = false;
  }

  this.showLabels = function(color_tid) {
    var offset = 5;
    var fid = Math.round(_self.player.currentTime() * _self.opt.fps) + offset;
    var data = {};
    if (_self._showAns) {
      for (var oi in _self.allScript.data[fid]) {
        if (_self._trackFilter[oi])
          data[oi] = _self.allScript.data[fid][oi];
      }
    } else if (_self._hidelabels){
      data = {};
    } else {
      data = _self.allScript.data[fid];
    }
    var svg = $('#'+did+'-show-bbox-svg');
    svg.html('');
    var poseLine = [
      [0, 1, '#6ee'], [1, 2, '#6ee'],
      [3, 4, '#6ee'], [4, 5, '#6ee'],
      [6, 7, '#c56'], [7, 8, '#c56'],
      [9, 10, '#c56'], [10, 11, '#c56'],
      [6, 12, '#ef8'], [9, 12, '#ef8'],
      [0, 13, '#ef8'], [3, 13, '#ef8'],
      [0, 6, '#ef8'], [3, 9, '#ef8']];
    for (var oi in data) {
      var x1 = -1, y1 = -1, tid = -1, w = -1, h = -1, prsn = false;
      // track
      var trackD = data[oi][4];
      if (trackD != -1) {
        x1 = trackD[0] * _self.scale;
        y1 = trackD[1] * _self.scale;
        w = trackD[2] * _self.scale;
        h = trackD[3] * _self.scale;
        tid = trackD[4];
        if (!color_tid[tid])
          color_tid[tid] = 'rgb('+
            Math.floor(Math.random()*256)+','+
            Math.floor(Math.random()*256)+','+
            Math.floor(Math.random()*256)+')';

        if (trackD[5] != 1) {
          var s = _self.allScript.objects[trackD[5]];
          svg.append(
            $('<rect>', {
              x: x1,
              y: y1,
              width: w,
              height: h,
              stroke: color_tid[tid],
              'fill-opacity': 0,
            })
          ).append(
            $('<rect>', {
              x: x1-1,
              y: y1,
              width: s.length*5+4,
              height: 8,
              fill: color_tid[tid],
              'fill-opacity': 0.6,
            })
          ).append(
            $('<text>', {
              x: x1+1,
              y: y1+6,
              fill: '#fff',
            }).html(s)
          );
        } else {
          prsn = true;
        }
      }

      // action
      var actD = data[oi][0];
      if (actD != -1 && prsn) {
        var s = "";
        for (var i = 0; i < actD.length; ++i)
          if (actD[i] == '1')
            s += _self.allScript.actions[i] + ' ';
        svg.append(
          $('<rect>', {
            x: x1-1,
            y: y1-16,
            width: s.length*5+4,
            height: 8,
            fill: color_tid[tid],
            'fill-opacity': 0.6,
          })
        ).append(
          $('<text>', {
            x: x1+1,
            y: y1-10,
            fill: '#fff',
          }).html(s)
        );
      }

      // behavior
      var bhvD = data[oi][2];
      if (bhvD != -1) {
        var s = "";
        for (var i = 0; i < bhvD.length; ++i)
          if (bhvD[i] == '1')
            s += _self.allScript.behaviors[i] + ' ';
        var dy = -24;
        if (!prsn)
          dy = 8;
        svg.append(
          $('<rect>', {
            x: x1-1,
            y: y1+dy,
            width: s.length*5+4,
            height: 8,
            fill: color_tid[tid],
            'fill-opacity': 0.6,
          })
        ).append(
          $('<text>', {
            x: x1+1,
            y: y1+dy+6,
            fill: '#fff',
          }).html(s)
        );
      }

      // attr
      var attrD = data[oi][1];
      if (attrD != -1 && prsn) {
        var s = "";
        for (var i = 0; i < 4; ++i)
          s += _self.allScript.attrs[i][attrD[i]];
        svg.append(
          $('<rect>', {
            x: x1-1,
            y: y1-8,
            width: s.length*5+4,
            height: 8,
            fill: color_tid[tid],
            'fill-opacity': 0.6,
          })
        ).append(
          $('<text>', {
            x: x1+1,
            y: y1-2,
            fill: '#fff',
          }).html(s)
        );
      }

      // pose
      var poseD = data[oi][3];
      if (poseD != -1) {
        for (var i = 0; i < poseD.length; ++i) {
          var x = poseD[i][0] * _self.scale;
          var y = poseD[i][1] * _self.scale;
          svg.append(
            $('<circle>', {
              cx: x,
              cy: y,
              r: 3,
              fill: '#f6c',
            })
          );
        }
        for (var li = 0; li < poseLine.length; ++li) {
          svg.append(
            $('<line>', {
              x1: poseD[poseLine[li][0]][0] * _self.scale,
              y1: poseD[poseLine[li][0]][1] * _self.scale,
              x2: poseD[poseLine[li][1]][0] * _self.scale,
              y2: poseD[poseLine[li][1]][1] * _self.scale,
              'stroke-width': 3,
              stroke: poseLine[li][2],
            })
          )
        }
      }

      // pairwise
      var pD = data[oi][5];
      if (pD != -1 && data[pD[0]]) {
        var xx1 = x1 + w/2;
        var yy1 = y1 + h/2;
        var xx2 = (data[pD[0]][4][0] + data[pD[0]][4][2]/2) * _self.scale;
        var yy2 = (data[pD[0]][4][1] + data[pD[0]][4][3]/2) * _self.scale;
        var xx3 = (xx1 + xx2) / 2;
        var yy3 = (yy1 + yy2) / 2;
        svg.append(
          $('<line>', {
            x1: xx1,
            y1: yy1,
            x2: xx2,
            y2: yy2,
            'stroke-width': 2,
            stroke: 'red',
          })
        );

        svg.append(
          $('<rect>', {
            x: xx3,
            y: yy3,
            width: pD[1].length*5+4,
            height: 8,
            fill: 'red',
            'fill-opacity': 0.6,
          })
        ).append(
          $('<text>', {
            x: xx3,
            y: yy3+6,
            fill: '#fff',
          }).html(pD[1])
        );
      }

    }
    _self._sbbox_svg_div.html(_self._sbbox_svg_div.html());
  }
}


function MSEEVideoGroup(vs) {
  this.mVideos = [];
  var _self = this;

  this._timeDelta = [];
  this.startTime = vs[0].opt.startTime;
  this.endTime = vs[0].opt.endTime;
  this._playRange = false;
  this.mainLoopFunc = [];

  for (var i = 0; i < vs.length; ++i) {
    this.mVideos.push(new MSEEVideo(vs[i].container, vs[i].opt));
    this._timeDelta.push(vs[i].opt.startTime / 1000);
    this.startTime = Math.min(this.startTime, vs[i].opt.startTime);
    this.endTime = Math.max(this.endTime, vs[i].opt.endTime);
  }
  this.startTime = new Date(this.startTime);
  this.endTime = new Date(this.endTime);
  this.duration = this.endTime - this.startTime;

  this.pause = function() {
    for (var i = 0; i < vs.length; ++i)
      _self.mVideos[i].player.pause();
    for (var e in _self.ui.globalControl)
      $('#'+e+' .vc-pause-button').removeClass('vc-pause-button').addClass('vc-play-button');
  }

  this.play = function() {
    for (var i = 0; i < vs.length; ++i)
      _self.mVideos[i].player.play();
    for (var e in _self.ui.globalControl)
      $('#'+e+' .vc-play-button').removeClass('vc-play-button').addClass('vc-pause-button');
  }

  this._syncTimeFunc = function(idx) {
    return function() {
      var t = _self.mVideos[idx].player.currentTime() + _self._timeDelta[idx];
      for (var j = 0; j < vs.length; ++j)
        if (idx != j)
          _self.mVideos[j].player.currentTime(t - _self._timeDelta[j]);
    }
  }

  this.loadAllScript = function() {
    for (var j = 0; j < vs.length; ++j)
      _self.mVideos[j].loadAllScript();
  }

  this.color_tid = {};

  this.showLabels = function() {
    for (var j = 0; j < vs.length; ++j)
      _self.mVideos[j].showLabels(_self.color_tid);
  }

  this.showAns = function(ans) {
    for (var j = 0; j < vs.length; ++j)
      _self.mVideos[j].showAns(ans);
    _self.playRange(new Date(ans['startTime']), new Date(ans['endTime']));
  }

  this.showAll = function() {
    for (var j = 0; j < vs.length; ++j)
      _self.mVideos[j].showAll();
  }

  for (var i = 0; i < vs.length; ++i) {
    $('#'+vs[i].container).on('mouseup', '.vjs-progress-control', _self._syncTimeFunc(i));
    $('#'+vs[i].container).on('click', '.vjs-paused', _self.play);
    $('#'+vs[i].container).on('click', '.vjs-playing', _self.pause);
  }

  this.ui = {
    globalControl: {},

    addGlobalControl: function(cid) {
      var step = 100;
      var maxv = Math.ceil(_self.duration / step);

      $('#'+cid).append(
        $('<div>', {class: 'vc-c'}).append(
        ).append(
          $('<div>', {class: 'vc-play-button'})
        ).append(
          $('<div>', {class: 'vc-gtime-s'})
        ).append(
          $('<div>', {class: 'vc-slider'}).append(
            $('<div>', {
              class: 'vc-nstslider nstSlider',
              'data-range_min': 0,
              'data-range_max': maxv,
              'data-cur_min': 0,
            }).append(
              $('<div>', {class: 'highlightPanel'})
            ).append(
              $('<div>', {class: 'bar'})
            ).append(
              $('<div>', {class: 'leftGrip'})
            )
          )
        ).append(
          $('<div>', {class: 'vc-gtime-e'}).html(_self.getGlobalEndtimeStr())
        )
      );

      var slds = '#'+cid+' .vc-nstslider';
      $(slds).nstSlider({
        "left_grip_selector": ".leftGrip",
        "highlight": {
          "grip_class": "gripHighlighted",
          "panel_selector": ".highlightPanel"
        }
      });
      _self.mainLoopFunc.push(function(){
        var p = Math.round((_self.getGlobalTime() - _self.startTime) / step);
        $(slds).nstSlider("set_position", p);
        $('#'+cid+' .vc-gtime-s').html(_self.getGlobalTimeStr());
      });
      $(slds).click(function(){
        var p = $(slds).nstSlider("get_current_min_value");
        var t = new Date(p*step + Math.round(_self.startTime));
        _self.pause();
        _self.setGlobalTime(t);
        _self.play();
      });

      $('#'+cid).on('click', '.vc-play-button', function(){
        _self.play();
      });
      $('#'+cid).on('click', '.vc-pause-button', function(){
        _self.pause();
      });

      _self.ui.globalControl[cid] = $('#'+cid);
    },

    displayTimeRange: function(cid, st, et) {
      var step = 100;
      var sp = Math.round(st - _self.startTime) / step;
      var ep = Math.round(et - _self.startTime) / step;
      $('#'+cid+' .vc-nstslider').nstSlider('highlight_range', sp, ep);
      $('#'+cid+' .highlightPanel').show();
    },

    hideTimeRange: function(cid) {
      $('#'+cid+' .highlightPanel').hide();
      $('#'+cid+' .leftGrip').removeClass('gripHighlighted');
    },
  }

  this.setGlobalTime = function(t) {
    for (var j = 0; j < vs.length; ++j)
      _self.mVideos[j].player.currentTime(t/1000 - _self._timeDelta[j]);
  }

  this.getGlobalTime = function() {
    var res = _self.mVideos[0].player.currentTime() + _self._timeDelta[0];
    for (var i = 1; i < vs.length; ++i)
      res = Math.max(res, _self.mVideos[i].player.currentTime() + _self._timeDelta[i]);
    return new Date(res*1000);
  }

  this.getGlobalTimeStr = function() {
    var gt = _self.getGlobalTime();
    var t = new Date(gt - gt.getTimezoneOffset()*60*1000);
    return t.toISOString().slice(11, 19);
  }

  this.getGlobalEndtimeStr = function() {
    var gt = _self.endTime;
    var t = new Date(gt - gt.getTimezoneOffset()*60*1000);
    return t.toISOString().slice(11, 19);
  }

  this.playRange = function(startT, endT) {
    _self.setGlobalTime(startT);
    _self._playRange = true;
    _self._playRangeStartTime = startT;
    _self._playRangeEndTime = endT;
  }

  this.mainLoopFunc.push(function(){
    if (_self._playRange) {
      if (_self.getGlobalTime() > _self._playRangeEndTime) {
        _self.setGlobalTime(_self._playRangeStartTime);
      }
    }
  });

  setInterval(function(){
    for (var i = 0; i < _self.mainLoopFunc.length; ++i)
      _self.mainLoopFunc[i]();
  }, 80);
}

function MSEETimeRange(sName, sTime, eTime) {
  var _self = this;
  this.name = sName;
  this.startTime = sTime;
  this.endTime = eTime;

  this._getTimeStr = function(gt) {
    var t = new Date(gt - gt.getTimezoneOffset()*60*1000);
    return t.toISOString().slice(11,-1);
  }

  this.getStr = function() {
    return _self._getTimeStr(_self.startTime) + '~' + _self._getTimeStr(_self.endTime);
  }

  this.getTimeRange = function() {
    return {
        'name': _self.name,
        'start': _self.startTime.toISOString(),
        'end': _self.endTime.toISOString(),
        'sceneTime': true,
    };
  }
}

function MSEETimeRangeManager() {
  var _self = this;
  this.timeRanges = {};

  this.addTimeRange = function(tr) {
    if (tr.name && !this.timeRanges[tr.name]) {
      this.timeRanges[tr.name] = tr;
      this.ui.updateAll();
    }
  }

  this.ui = {
    timeRangesDropdowns: {},

    createTimeRangesDropdown: function(cid) {
      $('#'+cid).html('').append(
        $('<button>', {
          id: cid+'-timeranges-dropdown-btn',
          class: "btn btn-default dropdown-toggle",
          type: "button",
          'data-toggle': "dropdown",
        }).append(
          $('<span>', {
            id: cid+'-timeranges-dropdown-dsp-span'
          }).html("Time Range ")
        ).append(
          $('<span>', {class: "caret"})
        )
      ).append(
        $('<ul>', {
          id: cid+'-timeranges-dropdown-ul',
          class: "dropdown-menu",
          'aria-labelledby': cid+'-timeranges-dropdown-btn',
        })
      );
      _self.ui.timeRangesDropdowns[cid] =
        $('#'+cid+'-timeranges-dropdown-ul').on('click', 'a', function(){
          var trname = $(this).attr('data-trname');
          $('#'+cid+'-timeranges-dropdown-dsp-span')
            .attr('data-trname', trname).html('Time Range: ' + trname +' ');
        });
      _self.ui.updateTimeRangesDropdown(cid);
    },

    updateTimeRangesDropdown: function(cid) {
      _self.ui.timeRangesDropdowns[cid].html('');
      _self.ui.timeRangesDropdowns[cid].append(
        $('<li>', {class: "dropdown-header"}).html('Select a Time Range')
      );
      for (var x in _self.timeRanges)
        _self.ui.timeRangesDropdowns[cid].append(
          $('<li>').append(
            $('<a>', {
              class: 'msee-timeranges-dropdown-a',
              href: '#',
              'data-trname': x,
            }).html(x)
          )
        );
    },

    updateAll: function() {
      for (cid in _self.ui.timeRangesDropdowns)
        this.updateTimeRangesDropdown(cid);
    },
  }
}


function MSEEObject(otype, oname, oconf) {
  var _self = this;
  this.type = otype;
  this.name = oname;
  this.socID = oconf.socID;
  this.videoID = oconf.videoID;
  this.frameID = oconf.frameID;
  if (otype == 'point') {
    this.x = parseInt(oconf.x);
    this.y = parseInt(oconf.y);
  }
  if (otype == 'bbox') {
    this.x1 = parseInt(oconf.x1);
    this.y1 = parseInt(oconf.y1);
    this.w = parseInt(oconf.w);
    this.h = parseInt(oconf.h);
  }
  this.objType = oconf.objType;

  this.getPredicate = function() {
    if (_self.type == 'empty')
      return {
        "name": _self.objType,
        "operands": [_self.name],
      };

    var p = {
      "name": _self.objType,
      "operands": [_self.name],
      "time": {
        "start": _self.frameID,
        "end": _self.frameID,
        "viewId": _self.videoID,
      },
      "location": {
        "viewId": _self.videoID,
      }
    };
    if (_self.type == 'point') {
      p["location"]["type"] = "point";
      p["location"]["points"] = [_self.x, _self.y];
    }
    if (_self.type == 'bbox') {
      p["location"]["type"] = "polygon";
      p["location"]["points"] = [
        _self.x1, _self.y1,
        _self.x1, _self.y1+_self.h,
        _self.x1+_self.w, _self.y1+_self.h,
        _self.x1+_self.w, _self.y1
      ];
    }
    return p;
  }
}


function MSEEObjectManager() {
  var _self = this;
  this.objects = {};

  this.addObject = function(obj) {
    if (obj.name && !this.objects[obj.name]) {
      this.objects[obj.name] = obj;
      this.ui.updateAll();
    } else {
      return null;
    }
    return this.objects[obj.name];
  }

  this.delObject = function(oname) {
    delete this.objects(oname);
    this.ui.updateAll();
  }

  this.ui = {
    objectsPools: {},
    objectsDropdowns: {},

    createObjectsPool: function(cid) {
      $('#'+cid).append(
        $('<div>', {
          id: cid+'-objects-pool',
          class: 'msee-objects-pool',
        })
      );
      _self.ui.objectsPools[cid] = $('#'+cid+'-objects-pool');
      _self.ui.updateObjectsPool(cid);
    },

    createObjectsDropdown: function(cid) {
      $('#'+cid).html('').append(
        $('<button>', {
          id: cid+'-objects-dropdown-btn',
          class: "btn btn-default dropdown-toggle",
          type: "button",
          'data-toggle': "dropdown",
        }).append(
          $('<span>', {
            id: cid+'-objects-dropdown-dsp-span'
          }).html("Object ")
        ).append(
          $('<span>', {class: "caret"})
        )
      ).append(
        $('<ul>', {
          id: cid+'-objects-dropdown-ul',
          class: "dropdown-menu",
          'aria-labelledby': cid+'-objects-dropdown-btn',
        })
      );
      _self.ui.objectsDropdowns[cid] =
        $('#'+cid+'-objects-dropdown-ul').on('click', 'a', function(){
          var oname = $(this).attr('data-oname');
          $('#'+cid+'-objects-dropdown-dsp-span')
            .attr('data-oname', oname).html(oname +' ');
        });
      _self.ui.updateObjectsDropdown(cid);
    },

    updateObjectsPool: function(cid) {
      _self.ui.objectsPools[cid].html('');
      for (var x in _self.objects)
        _self.ui.objectsPools[cid].append(
          $('<span>', {
            class: "label label-default msee-objects-pool-span",
            'data-oname': x,
          }).html(x)
        );
    },

    updateObjectsDropdown: function(cid) {
      _self.ui.objectsDropdowns[cid].html('');
      _self.ui.objectsDropdowns[cid].append(
        $('<li>', {class: "dropdown-header"}).html('Select an object')
      );
      for (var x in _self.objects)
        _self.ui.objectsDropdowns[cid].append(
          $('<li>').append(
            $('<a>', {
              class: 'msee-objects-dropdown-a',
              href: '#',
              'data-oname': x,
            }).html(x)
          )
        );
    },

    updateAll: function() {
      for (cid in _self.ui.objectsPools)
        this.updateObjectsPool(cid);
      for (cid in _self.ui.objectsDropdowns)
        this.updateObjectsDropdown(cid);
    },
  }
}


function MSEEQuery(soc, storyline) {
  this._query = {
    "soc": soc,
    "storyline": storyline,
    "query": {
      "isPolar": false,
      "predicates": [],
    },
    "isNaturalLanguage": false
  };

  this.setPolar = function(isPolar){
    this._query["query"]["isPolar"] = isPolar;
  }

  this._objPredicates = {};
  this._predicateGroups = [];
  this._objPredicateCounts = {};
  this.ontEdges = [];
  var _self = this;

  this.empty = function(){
    return Object.keys(_self._objPredicates).length == 0;
  }

  this.clear = function(){
    this._query["query"]["predicates"] = [];
    this._objPredicates = {};
    this._predicateGroups = [];
    this._objPredicateCounts = {};
    this.ontEdges = [];
  }

  this.getQuery = function(){
    var res = $.extend(true, {}, _self._query);
    for (var obj in _self._objPredicates)
      res["query"]["predicates"].push(_self._objPredicates[obj]);
    return res
  }

  this.getNaturalLanguageQuery = function(queryText, ts, ps){
    var res = $.extend(true, {}, _self._query);
    res['query'] = {
      'nlQuery': queryText,
      'times': [],
      // 'predicates': [],
    };
    for (var e in ts)
      res['query']['times'].push(ts[e].getTimeRange());

    if (Object.keys(ps).length > 0) {
      res['query']['predicates'] = [];
      for (var e in ps)
        res['query']['predicates'].push(ps[e].getPredicate());
    }

    res["isNaturalLanguage"] = true;
    return res;
  }

  this._addObjPredicates = function(obj){
    if (_self._objPredicateCounts[obj.name]){
      ++_self._objPredicateCounts[obj.name];
      return;
    }
    _self._objPredicateCounts[obj.name] = 1;
    _self._objPredicates[obj.name] = obj.getPredicate();
  };

  this.addAttrPredicates = function(obj, attr, info){
    if (attr == 'Exist'){
      _self._addObjPredicates(obj);
      _self._predicateGroups.push({
        'ps': null,
        'ops': [obj.name],
        'name': attr,
      });
      return;
    }

    _self.ontEdges.push([obj.objType, attr]);
    // if (info.time) {
    if (false) {
      var obj2 = {
        'type': 'empty',
        'objType': obj.objType,
        'name': obj.name+'_'+_genRandomStr(3),
      }
      var p1 = {
        "name": attr,
        "operands": [obj2.name],
        "time": info.time,
      }
      var p2 = {
        "name": "SameObject",
        "operands": [obj.name, obj2.name],
      }
      _self._addObjPredicates(obj2);
      _self._addObjPredicates(obj);
      _self._addObjPredicates(obj2);
      _self._query["query"]["predicates"].push(p1);
      _self._query["query"]["predicates"].push(p2);
      _self._predicateGroups.push({
        'ps': [p1, p2],
        'ops': [obj.name],
        'name': attr,
      });
    } else {
      var p = {
        "name": attr,
        "operands": [obj.name],
      };
      // -- without SameObject
      if (info.time)
        p["time"] = info.time;
      // --
      _self._addObjPredicates(obj);
      _self._query["query"]["predicates"].push(p);
      _self._predicateGroups.push({
        'ps': [p],
        'ops': p.operands,
        'name': attr,
      });
    }
  };

  this.addRelPredicates = function(obj1, obj2, rel, info){
    _self.ontEdges.push([obj1.objType, obj2.objType, rel]);
    // if (info.time) {
    if (false) {
      var obj12 = {
        'type': 'empty',
        'objType': obj1.objType,
        'name': obj1.name+'_'+_genRandomStr(3),
      }
      var obj22 = {
        'type': 'empty',
        'objType': obj2.objType,
        'name': obj2.name+'_'+_genRandomStr(3),
      }
      var p1 = {
        "name": rel,
        "operands": [obj12.name, obj22.name],
        "time": info.time,
      }
      var p2 = {
        "name": "SameObject",
        "operands": [obj1.name, obj12.name],
      }
      var p3 = {
        "name": "SameObject",
        "operands": [obj2.name, obj22.name],
      }
      _self._addObjPredicates(obj12);
      _self._addObjPredicates(obj22);
      _self._addObjPredicates(obj1);
      _self._addObjPredicates(obj12);
      _self._addObjPredicates(obj2);
      _self._addObjPredicates(obj22);
      _self._query["query"]["predicates"].push(p1);
      _self._query["query"]["predicates"].push(p2);
      _self._query["query"]["predicates"].push(p3);
      _self._predicateGroups.push({
        'ps': [p1, p2, p3],
        'ops': [obj1.name, obj2.name],
        'name': rel,
      });
    } else {
      var p = {
        "name": rel,
        "operands": [obj1.name, obj2.name],
      };
      // -- without SameObject
      if (info.time)
        p["time"] = info.time;
      // --
      _self._addObjPredicates(obj1);
      _self._addObjPredicates(obj2);
      _self._query["query"]["predicates"].push(p);
      _self._predicateGroups.push({
        'ps': [p],
        'ops': p.operands,
        'name': rel,
      });
    }
  };

  this.delPredicateGroup = function(pi) {
    for (var j = 0; j < _self._predicateGroups[pi].ps.length; ++j)
      for (var k = 0; k < _self._query["query"]["predicates"].length; ++k)
        if (_self._query["query"]["predicates"][k] == _self._predicateGroups[pi].ps[j]) {
          var op = _self._query["query"]["predicates"][k]["operands"];
          // console.log(op);
          for (var i = 0; i < op.length; ++i) {
            --_self._objPredicateCounts[op[i]];
            if (_self._objPredicateCounts[op[i]] == 0)
              delete _self._objPredicates[op[i]];
          }
          _self._query["query"]["predicates"].splice(k, 1);
        }
    _self._predicateGroups.splice(pi, 1);
    // console.log(_self.getQuery());
  }

  this.ui = {
    getQueryDisplay: function(){
      var res = $('<span>', {class: 'msee-query-span'});
      // var preds = _self._query["query"]["predicates"];
      var pgs = _self._predicateGroups;
      // for (var i = 0; i < preds.length; ++i) {
      for (var i = 0; i < pgs.length; ++i) {
        var ps = $('<span>', {class: 'msee-query-predicate-span'});
        if (pgs[i].ops.length == 1) {
          ps.append(
            $('<span>', {class: 'msee-query-predicate-obj-span'})
              .html(pgs[i].ops[0])
          ).append(
            $('<span>', {class: 'msee-query-predicate-attr-span'})
              .html(' '+pgs[i]["name"])
          );
        } else if (pgs[i].ops.length == 2) {
          ps.append(
            $('<span>', {class: 'msee-query-predicate-obj-span'})
              .html(pgs[i].ops[0])
          ).append(
            $('<span>', {class: 'msee-query-predicate-rel-span'})
              .html(' '+pgs[i]["name"]+' ')
          ).append(
            $('<span>', {class: 'msee-query-predicate-obj-span'})
              .html(pgs[i].ops[1])
          );
        }
        ps.append(
          $('<span>', {
            class: 'msee-query-predicate-del glyphicon glyphicon-remove',
            'data-pi': i,
          })
        )
        if (i > 0)
          res.append($('<span>', {class: 'msee-query-add-span'}).html(' AND '));
        res.append(ps);
      }
      return res;
    }
  }

}
