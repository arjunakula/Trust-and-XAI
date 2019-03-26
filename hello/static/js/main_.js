

$(document).ready(function(){


  $('#interaction-area .m-tab-a').click(function(){
    $(".m-tab").hide();
    $('#'+$(this).attr('data-tab')).show();
  });

  $('#interaction-area .q-tab-a').click(function(){
    $(".q-tab").hide();
    $('#'+$(this).attr('data-tab')).show();
  });

  var objMgr = new MSEEObjectManager();
  objMgr.ui.createObjectsPool('objects-pool');
  objMgr.ui.createObjectsDropdown('q-attr-o');
  objMgr.ui.createObjectsDropdown('q-rel-o1');
  objMgr.ui.createObjectsDropdown('q-rel-o2');
  $("#object-create-btn").click(function(){
    var oname = $("#anno-name").val();
    var otype = $("#anno-type-radios").attr('data-otype');
    var oconf = {};
    oconf.socID = $('#socid-span').attr('data-socid');
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
      'soc_id': $('#socid-span').attr('data-socid'),
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
    $('#socid-span').attr('data-socid'),
    storylineID
  );

  function appendQuestion(q) {
    $('#history-pool').append(
      $('<div>', {
        class: 'history-entry history-entry-q'
      }).html('Q: '+q).hide().fadeIn('slow')
    );
    scrollHistory();
  }

  function appendAnswer(a) {
    $('#history-pool').append(
      $('<div>', {
        class: 'history-entry history-entry-a'
      }).html('A: '+ a).hide().fadeIn('slow')
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
    if ($("#ptr-tog").attr('data-b') == 1)
      info.time = {
        'start': ptrStartTime.toISOString(),
        'end': ptrEndTime.toISOString(),
        'sceneTime': true,
      }
    query.addAttrPredicates(objMgr.objects[objn], attr, info);
    updatePreview();
    console.log(query.getQuery());
  });

  $('#q-rel').on('click', '.list-group-item', function() {
    var objn1 = $('#q-rel-o1-objects-dropdown-dsp-span').attr('data-oname');
    var objn2 = $('#q-rel-o2-objects-dropdown-dsp-span').attr('data-oname');
    var rel = $(this).html();
    var info = {};
    if ($("#ptr-tog").attr('data-b') == 1)
      info.time = {
        'start': ptrStartTime.toISOString(),
        'end': ptrEndTime.toISOString(),
        'sceneTime': true,
      }
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



  var pgCanvas = new MSEEParseGraph('#canvas-pg', 700, 350);
  // Graph visualization switch
  function showAnsGraph() {
    var graph_idx = parseInt($('#select-graph-dropdown-ul').attr('data-gid'));
    if (returnedGraphs && graph_idx < returnedGraphs.length){
      $("#select-graph-dropdown-span").html('Showing result ' + (graph_idx + 1));
      pgCanvas.clear();
      pgCanvas.drawGraph(returnedGraphs[graph_idx]);
      videoGroup.showAns(ansDetail[graph_idx]);
      videoGroup.ui.displayTimeRange('main-vc',
        new Date(ansDetail[graph_idx]['startTime']),
        new Date(ansDetail[graph_idx]['endTime']));
    }
  }

  $('#select-graph-dropdown-ul').on('click', 'a', function(){
    $('#select-graph-dropdown-ul').attr('data-gid', $(this).attr('data-graph-id'));
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

  $('#interaction-area .m-tab-a').click(function(){
    videoGroup.ui.hideTimeRange('main-vc');
    videoGroup.showAll();
  });

});
